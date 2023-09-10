import {DataHandlerContext} from '@subsquid/evm-processor'
import {toJSON} from '@subsquid/util-internal-json'
import {Store} from '../db'
import {EntityBuffer, NamedEntityBuffer} from '../entityBuffer'
import {Collect, Comment, Follow, Mirror, Post, Profile, Publication, PublicationVariant} from '../model'
import * as spec from '../abi/Lens'
import {Log, lensProtocolAddress} from '../processor'
import {ProfileImageUpdateData} from './types'
import {In} from 'typeorm'


function toDate(value: bigint): Date {
    return new Date(Number(value)*1000)
}

function toID(profileId: bigint, pubId: bigint): string {
    return `${profileId}-${pubId}`
}


type Pub = ({data: Post, variant: PublicationVariant.POST} |
    {data: Mirror, variant: PublicationVariant.MIRROR} |
    {data: Comment, variant: PublicationVariant.COMMENT}) & {id: string}


export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                NamedEntityBuffer.add('Collected',
                    new Collect({
                        id: log.id,
                        collectorAddress: e[0],
                        profileId: e[1],
                        pubId: e[2],
                        rootProfileId: e[3],
                        rootPubId: e[4],
                        timestamp: toDate(e[6]),
                    })
                )
                break
            }
            case spec.events.CommentCreated.topic: {
                let e = spec.events.CommentCreated.decode(log)
                NamedEntityBuffer.add<Pub>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    data: new Comment({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        profileIdPointed: e[3],
                        pubIdPointed: e[4],
                        timestamp: toDate(e[10]),
                    }),
                    variant: PublicationVariant.COMMENT,
                })
                break
            }
            case spec.events.Followed.topic: {
                let e = spec.events.Followed.decode(log)
                EntityBuffer.add(
                    new Follow({
                        id: log.id,
                        followerAddress: e[0],
                        profileIds: toJSON(e[1]),
                        timestamp: toDate(e[3]),
                    })
                )
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                NamedEntityBuffer.add<Pub>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    data: new Mirror({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        profileIdPointed: e[2],
                        pubIdPointed: e[3],
                        timestamp: toDate(e[7]),
                    }),
                    variant: PublicationVariant.MIRROR,
                })
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                NamedEntityBuffer.add<Pub>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    data: new Post({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        timestamp: toDate(e[7]),
                    }),
                    variant: PublicationVariant.POST,
                })
                break
            }
            case spec.events.ProfileCreated.topic: {
                let e = spec.events.ProfileCreated.decode(log)
                NamedEntityBuffer.add('ProfileCreated', new Profile({
                    id: e[0].toString(),
                    profileId: e[0],
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
                NamedEntityBuffer.add<ProfileImageUpdateData>('ProfileImageURISet', {
                    id: e[0].toString(),
                    profileId: e[0],
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
    const updatedProfiles = NamedEntityBuffer.flush<ProfileImageUpdateData>('ProfileImageURISet')
    const publications = NamedEntityBuffer.flush<Pub>('PublicationCreated')
    const createdCollects = NamedEntityBuffer.flush<Collect>('Collected')

    // get ids used in entities

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfiles.map(x => x.id),
    ]
    const pubIds: string[] = []

    for (var pubData of publications) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                let post = pubData.data
                profileIds.push(post.profileId.toString())
                break
            }
            case PublicationVariant.MIRROR: {
                let mirror = pubData.data
                profileIds.push(mirror.profileId.toString())
                profileIds.push(mirror.profileIdPointed.toString())
                pubIds.push(toID(mirror.profileIdPointed, mirror.pubIdPointed))
                break
            }
            case PublicationVariant.COMMENT: {
                let comment = pubData.data
                profileIds.push(comment.profileId.toString())
                profileIds.push(comment.profileIdPointed.toString())
                pubIds.push(toID(comment.profileIdPointed, comment.pubIdPointed))
                break
            }
        }
    }

    createdCollects.forEach(x => {
        profileIds.push(x.profileId.toString())
        profileIds.push(x.rootProfileId.toString())
        pubIds.push(toID(x.profileId, x.pubId))
        pubIds.push(toID(x.rootProfileId, x.rootPubId))
    })

    // load entities using gathered ids

    const storeProfilesByID = await ctx.store.findBy(Profile, {id: In(profileIds)})
    const profilesByID: Map<string, Profile> = new Map(
        storeProfilesByID.map((profile) => [profile.profileId.toString(), profile])
    )
    const profiles = new Map([
        ...profilesByID,
    ])

    const storePubsByID = await ctx.store.findBy(Publication, {id: In(pubIds)})
    const pubsByID: Map<string, Publication> = new Map(
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
            ctx.log.warn(`profile is missing, profile: ${toJSON(profile)}`)
            continue
        }
        profileEntity.imageUri = profile.imageUri
        profileEntity.updatedAt = profile.updatedAt
    }

    profiles.forEach(x => EntityBuffer.add(x))

    // update publications

    for (var pubData of publications.sort(
        // sort by timestamp for correct entity insertion order
        (a, b) => (a.data.timestamp < b.data.timestamp ? -1 : 1))
    ) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                let post = pubData.data
                let creatorEntity = profiles.get(post.profileId.toString())
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for post is missing, post: ${toJSON(post)}`)
                    continue
                }
                post.creator = creatorEntity
                let pubEntity = new Publication({
                    id: post.id,
                    profileId: post.profileId,
                    pubId: post.pubId,
                    creator: post.creator,
                    variant: PublicationVariant.POST,
                    timestamp: post.timestamp
                })
                post.publication = pubEntity
                pubs.set(pubEntity.id, pubEntity)
                EntityBuffer.add(pubEntity)
                EntityBuffer.add(post)
                break
            }
            case PublicationVariant.MIRROR: {
                let mirror = pubData.data
                let creatorEntity = profiles.get(mirror.profileId.toString())
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for mirror is missing, mirror: ${toJSON(mirror)}`)
                    continue
                }
                let creatorPointedEntity = profiles.get(mirror.profileIdPointed.toString())
                if (creatorPointedEntity == null) {
                    ctx.log.warn(`pointed profile for mirror is missing, mirror: ${toJSON(mirror)}`)
                    continue
                }
                let pubPointedEntity = pubs.get(toID(mirror.profileIdPointed, mirror.pubIdPointed))
                if (pubPointedEntity == null) {
                    ctx.log.warn(`pointed publication for mirror is missing, mirror: ${toJSON(mirror)}`)
                    continue
                }
                mirror.creator = creatorEntity
                mirror.creatorPointed = creatorPointedEntity
                mirror.publicationPointed = pubPointedEntity
                let pubEntity = new Publication({
                    id: mirror.id,
                    profileId: mirror.profileId,
                    pubId: mirror.pubId,
                    creator: mirror.creator,
                    variant: PublicationVariant.MIRROR,
                    timestamp: mirror.timestamp
                })
                mirror.publication = pubEntity
                pubs.set(pubEntity.id, pubEntity)
                EntityBuffer.add(pubEntity)
                EntityBuffer.add(mirror)
                break
            }
            case PublicationVariant.COMMENT: {
                let comment = pubData.data
                let creatorEntity = profiles.get(comment.profileId.toString())
                if (creatorEntity == null) {
                    ctx.log.fatal(`creator profile for comment is missing, comment: ${toJSON(comment)}`)
                    continue
                }
                let creatorPointedEntity = profiles.get(comment.profileIdPointed.toString())
                if (creatorPointedEntity == null) {
                    ctx.log.fatal(`pointed profile for comment is missing, comment: ${toJSON(comment)}`)
                    continue
                }
                let pubPointedEntity = pubs.get(toID(comment.profileIdPointed, comment.pubIdPointed))
                if (pubPointedEntity == null) {
                    ctx.log.warn(`pointed publication for comment is missing, comment: ${toJSON(comment)}`)
                    continue
                }
                comment.creator = creatorEntity
                comment.creatorPointed = creatorPointedEntity
                comment.publicationPointed = pubPointedEntity
                let pubEntity = new Publication({
                    id: comment.id,
                    profileId: comment.profileId,
                    pubId: comment.pubId,
                    creator: comment.creator,
                    variant: PublicationVariant.COMMENT,
                    timestamp: comment.timestamp
                })
                comment.publication = pubEntity
                pubs.set(pubEntity.id, pubEntity)
                EntityBuffer.add(pubEntity)
                EntityBuffer.add(comment)
                break
            }
        }
    }

    for (var collect of createdCollects) {
        let pubCreatorEntity = profiles.get(collect.profileId.toString())
        if (pubCreatorEntity == null) {
            ctx.log.warn(`creator profile for collect is missing, collect: ${toJSON(collect)}`)
            continue
        }
        let rootCreatorEntity = profiles.get(collect.rootProfileId.toString())
        if (rootCreatorEntity == null) {
            ctx.log.warn(`root profile for collect is missing, collect: ${toJSON(collect)}`)
            continue
        }
        let pubEntity = pubs.get(toID(collect.profileId, collect.pubId))
        if (pubEntity == null) {
            ctx.log.warn(`publication for collect is missing, collect: ${toJSON(collect)}`)
            continue
        }
        let rootPubEntity = pubs.get(toID(collect.rootProfileId, collect.rootPubId))
        if (rootPubEntity == null) {
            ctx.log.warn(`root publication for collect is missing, collect: ${toJSON(collect)}`)
            continue
        }
        collect.pubCreator = pubCreatorEntity
        collect.publication = pubEntity
        collect.rootCreator = rootCreatorEntity
        collect.rootPublication = rootPubEntity
        EntityBuffer.add(collect)
    }
}
