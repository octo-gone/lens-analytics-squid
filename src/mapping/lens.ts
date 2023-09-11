import {DataHandlerContext} from '@subsquid/evm-processor'
import {Store} from '../db'
import {NamedEntityBuffer} from '../entityBuffer'
import * as spec from '../abi/Lens'
import {Log, lensProtocolAddress} from '../processor'
import {ProfileImageUpdate} from './types'
import {In} from 'typeorm'
import {Mirror, Post, Comment, PublicationVariant, PublicationRef, Profile} from '../model'
import {fetchContentBatch} from './ipfs'
import {toID, toDate, removeBrokenSurrogate} from './utils'


type Publication = (
    {post: Post, variant: PublicationVariant.POST} |
    {mirror: Mirror, variant: PublicationVariant.MIRROR, mirroredProfileId: string, mirroredPubId: string} |
    {comment: Comment, variant: PublicationVariant.COMMENT, commentedProfileId: string, commentedPubId: string}
) & {id: string, creatorId: string, timestamp: Date}


export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.CommentCreated.topic: {
                let e = spec.events.CommentCreated.decode(log)
                NamedEntityBuffer.add<Publication>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    commentedPubId: toID(e[3], e[4]),
                    commentedProfileId: e[3].toString(),
                    comment: new Comment({
                        id: toID(e[0], e[1]),
                        contentUri: e[2]
                    }),
                    variant: PublicationVariant.COMMENT,
                    timestamp: toDate(e[10]),
                })
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                NamedEntityBuffer.add<Publication>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    mirroredPubId: toID(e[2], e[3]),
                    mirroredProfileId: e[2].toString(),
                    mirror: new Mirror({
                        id: toID(e[0], e[1]),
                    }),
                    variant: PublicationVariant.MIRROR,
                    timestamp: toDate(e[7]),
                })
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                NamedEntityBuffer.add<Publication>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    post: new Post({
                        id: toID(e[0], e[1]),
                        contentUri: e[2],
                    }),
                    variant: PublicationVariant.POST,
                    timestamp: toDate(e[7]),
                })
                break
            }
            case spec.events.ProfileCreated.topic: {
                let e = spec.events.ProfileCreated.decode(log)
                NamedEntityBuffer.add('ProfileCreated', new Profile({
                    id: e[0].toString(),
                    address: e[2],
                    handle: e[3],
                    imageUri: e[4],
                    createdAt: toDate(e[8]),
                    updatedAt: toDate(e[8]),
                }))
                break
            }
            case spec.events.ProfileImageURISet.topic: {
                let e = spec.events.ProfileImageURISet.decode(log)
                NamedEntityBuffer.add<ProfileImageUpdate>('ProfileImageURISet', {
                    id: e[0].toString(),
                    imageUri: e[1],
                    updatedAt: toDate(e[2]),
                })
                break
            }
        }
    }
    catch (error) {
        ctx.log.error({error, blockNumber: log.block.height, blockHash: log.block.hash, lensProtocolAddress}, `unable to decode event "${log.topics[0]}"`)
    }
}


export async function mergeData(ctx: DataHandlerContext<Store>) {
    // load fetched entities from buffer

    const createdProfiles = NamedEntityBuffer.flush<Profile>('ProfileCreated')
    const updatedProfiles = NamedEntityBuffer.flush<ProfileImageUpdate>('ProfileImageURISet')
    const createdPublications = NamedEntityBuffer.flush<Publication>('PublicationCreated')

    // get ids used in entities

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfiles.map(x => x.id),
    ]
    const pubIds: string[] = []

    for (var pubData of createdPublications) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                profileIds.push(pubData.creatorId)
                break
            }
            case PublicationVariant.MIRROR: {
                profileIds.push(pubData.creatorId)
                profileIds.push(pubData.mirroredProfileId)
                pubIds.push(pubData.mirroredPubId)
                break
            }
            case PublicationVariant.COMMENT: {
                profileIds.push(pubData.creatorId)
                profileIds.push(pubData.commentedProfileId)
                pubIds.push(pubData.commentedPubId)
                break
            }
        }
    }

    // load entities using gathered ids

    const storeProfilesByID = await ctx.store.findBy(Profile, {id: In(profileIds)})
    const profilesByID: Map<string, Profile> = new Map(
        storeProfilesByID.map((profile) => [profile.id, profile])
    )
    const profiles = new Map([
        ...profilesByID,
    ])

    const storePubsByID = await ctx.store.findBy(PublicationRef, {id: In(pubIds)})
    const pubsByID: Map<string, PublicationRef> = new Map(
        storePubsByID.map((pub) => [pub.id, pub])
    )
    const pubs = new Map([
        ...pubsByID,
    ])

    // update profiles

    for (var profileEntity of createdProfiles) {
        profiles.set(profileEntity.id, profileEntity)
    }

    for (var profile of updatedProfiles) {
        let profileEntity = profiles.get(profile.id)
        if (profileEntity == null) {
            ctx.log.warn(`profile is missing, profile: ${JSON.stringify(profile)}`)
            continue
        }
        profileEntity.imageUri = profile.imageUri
        profileEntity.updatedAt = profile.updatedAt
    }

    profiles.forEach(x => NamedEntityBuffer.add('Save', x))

    // update publications

    const contentUris: {pubs: {content: unknown}[], uris: string[]} = {pubs: [], uris: []}
    for (var pubData of createdPublications.sort(
        // sort by timestamp for correct entity insertion order
        (a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    ) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for post is missing, post: ${JSON.stringify(pubData)}`)
                    continue
                }
                contentUris.pubs.push(pubData.post)
                contentUris.uris.push(pubData.post.contentUri)
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.POST,
                    post: pubData.post,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.post)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
            case PublicationVariant.MIRROR: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                let mirroredProfileEntity = profiles.get(pubData.mirroredProfileId)
                if (mirroredProfileEntity == null) {
                    ctx.log.warn(`mirrored profile for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                let mirroredPubEntity = pubs.get(pubData.mirroredPubId)
                if (mirroredPubEntity == null) {
                    ctx.log.warn(`mirrored publication for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                pubData.mirror.mirroredCreator = mirroredProfileEntity
                pubData.mirror.mirroredPublication = mirroredPubEntity
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.MIRROR,
                    mirror: pubData.mirror,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.mirror)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
            case PublicationVariant.COMMENT: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                let commentedProfileEntity = profiles.get(pubData.commentedProfileId)
                if (commentedProfileEntity == null) {
                    ctx.log.warn(`commented profile for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                let commentedPubEntity = pubs.get(pubData.commentedPubId)
                if (commentedPubEntity == null) {
                    ctx.log.warn(`commented publication for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                contentUris.pubs.push(pubData.comment)
                contentUris.uris.push(pubData.comment.contentUri)
                pubData.comment.commentedCreator = commentedProfileEntity
                pubData.comment.commentedPublication = commentedPubEntity
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.COMMENT,
                    comment: pubData.comment,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.comment)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
        }
    }

    const contents = await fetchContentBatch(ctx, contentUris.uris)
    contentUris.pubs.forEach((pubEntity, index) => {
        // for some reason someone removed low-surrogate from UTF-16 character (emoji)
        // this caused issues with typeorm
        // https://data.lens.phaver.com/api/lens/posts/21cb17c9-4b76-43b1-b782-0c6b075fa64e
        let [name, removed] = removeBrokenSurrogate(contents[index]?.name || '')
        if (removed) {
            contents[index].name = name
        }
        pubEntity.content = contents[index]
    })
}
