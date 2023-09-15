import {DataHandlerContext} from '@subsquid/evm-processor'
import {Store} from '../db'
import {NamedEntityBuffer} from '../entityBuffer'
import * as spec from '../abi/Lens'
import * as specHub from '../abi/LensHub'
import {Log} from '../processor'
import {ProfileImageUpdateData, PublicationData, CollectData, ProfileTransferData} from './types'
import {In} from 'typeorm'
import {Mirror, Post, Comment, PublicationVariant, PublicationRef, Profile, Collect, Follow, ProfileTransfer, ProfileImageUpdate} from '../model'
import {fetchContentBatch} from './ipfs'
import {toID, toDate, removeBrokenSurrogate} from './utils'


export const lensProtocolAddress = '0xdb46d1dc155634fbc732f92e853b10b288ad5a1d'

export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                NamedEntityBuffer.add<CollectData>('PublicationCollected', {
                    id: log.id,
                    collector: e[0],
                    txHash: log.transactionHash,
                    profileId: e[1].toString(),
                    pubId: toID(e[1], e[2]),
                    rootProfileId: e[3].toString(),
                    rootPubId: toID(e[3], e[4]),
                    timestamp: toDate(e[6]),
                })
                break
            }
            case spec.events.CommentCreated.topic: {
                let e = spec.events.CommentCreated.decode(log)
                NamedEntityBuffer.add<PublicationData>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    commentedPubId: toID(e[3], e[4]),
                    commentedProfileId: e[3].toString(),
                    comment: new Comment({
                        id: toID(e[0], e[1]),
                        contentUri: e[2]
                    }),
                    variant: PublicationVariant.COMMENT,
                    txHash: log.transactionHash,
                    timestamp: toDate(e[10]),
                })
                break
            }
            case spec.events.Followed.topic: {
                let e = spec.events.Followed.decode(log)
                NamedEntityBuffer.add<Follow>('Save', new Follow({
                    id: log.id,
                    followerAddress: e[0],
                    txHash: log.transactionHash,
                    profileIds: e[1].map(x => x.toString()),
                    followModuleDatas: e[2],
                    timestamp: toDate(e[3]),
                }))
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                NamedEntityBuffer.add<PublicationData>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    mirroredPubId: toID(e[2], e[3]),
                    mirroredProfileId: e[2].toString(),
                    mirror: new Mirror({
                        id: toID(e[0], e[1]),
                    }),
                    variant: PublicationVariant.MIRROR,
                    txHash: log.transactionHash,
                    timestamp: toDate(e[7]),
                })
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                NamedEntityBuffer.add<PublicationData>('PublicationCreated', {
                    id: toID(e[0], e[1]),
                    creatorId: e[0].toString(),
                    post: new Post({
                        id: toID(e[0], e[1]),
                        contentUri: e[2],
                    }),
                    variant: PublicationVariant.POST,
                    txHash: log.transactionHash,
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
                NamedEntityBuffer.add<ProfileImageUpdateData>('ProfileImageURISet', {
                    id: log.id,
                    profileId: e[0].toString(),
                    imageUri: e[1],
                    txHash: log.transactionHash,
                    timestamp: toDate(e[2]),
                })
                break
            }
            case specHub.events.Transfer.topic: {
                let e = specHub.events.Transfer.decode(log)
                if (e[0] === '0x0000000000000000000000000000000000000000') break
                NamedEntityBuffer.add<ProfileTransferData>('ProfileTransfered', {
                    id: log.id,
                    from: e[0],
                    to: e[1],
                    profileId: e[2].toString(),
                    txHash: log.transactionHash,
                    timestamp: new Date(log.block.timestamp),
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
    const updatedProfileImages = NamedEntityBuffer.flush<ProfileImageUpdateData>('ProfileImageURISet')
    const createdPublications = NamedEntityBuffer.flush<PublicationData>('PublicationCreated')
    const createdCollects = NamedEntityBuffer.flush<CollectData>('PublicationCollected')
    const transferedProfiles = NamedEntityBuffer.flush<ProfileTransferData>('ProfileTransfered')

    // get ids used in entities

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfileImages.map(x => x.profileId),
        ...transferedProfiles.map(x => x.profileId)
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

    for (var collectData of createdCollects) {
        profileIds.push(collectData.profileId)
        profileIds.push(collectData.rootProfileId)
        pubIds.push(collectData.pubId)
        pubIds.push(collectData.rootPubId)
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

    profiles.forEach(x => NamedEntityBuffer.add('Save', x))

    for (var profileImageUpdate of updatedProfileImages) {
        let profileEntity = profiles.get(profileImageUpdate.profileId)
        if (profileEntity == null) {
            ctx.log.warn(`profile for image update is missing, profile: ${JSON.stringify(profileImageUpdate)}`)
            continue
        }
        let profileImageUpdateEntity = new ProfileImageUpdate({
            id: profileImageUpdate.id,
            oldImageUri: profileEntity.imageUri,
            newImageUri: profileImageUpdate.imageUri,
            profile: profileEntity,
            txHash: profileImageUpdate.txHash,
            timestamp: profileImageUpdate.timestamp,
        })
        profileEntity.imageUri = profileImageUpdate.imageUri
        profileEntity.updatedAt = profileImageUpdate.timestamp
        NamedEntityBuffer.add('Save', profileImageUpdateEntity)
    }

    for (var profileTransfer of transferedProfiles) {
        let transferedProfileEntity = profiles.get(profileTransfer.profileId)
        if (transferedProfileEntity == null) {
            ctx.log.warn(`transfered profile is missing, tranfer: ${JSON.stringify(profileTransfer)}`)
            continue
        }
        let profileTransferEntity = new ProfileTransfer({
            id: profileTransfer.id,
            from: profileTransfer.from,
            to: profileTransfer.to,
            profile: transferedProfileEntity,
            txHash: profileTransfer.txHash,
            timestamp: profileTransfer.timestamp
        })
        transferedProfileEntity.address = profileTransfer.to
        transferedProfileEntity.updatedAt = profileTransfer.timestamp
        NamedEntityBuffer.add('Save', profileTransferEntity)
    }

    // update publications

    const contentUris: {pubs: (Post | Comment)[], uris: string[]} = {pubs: [], uris: []}
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
                    txHash: pubData.txHash,
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
                    txHash: pubData.txHash,
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
                    txHash: pubData.txHash,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.comment)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
        }
    }

    for (var collectData of createdCollects) {
        let commentedProfileEntity = profiles.get(collectData.profileId)
        if (commentedProfileEntity == null) {
            ctx.log.warn(`collected profile for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let collectedPubEntity = pubs.get(collectData.pubId)
        if (collectedPubEntity == null) {
            ctx.log.warn(`collected publication for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let commentedRootProfileEntity = profiles.get(collectData.rootProfileId)
        if (commentedRootProfileEntity == null) {
            ctx.log.warn(`collected root profile for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let collectedRootPubEntity = pubs.get(collectData.rootPubId)
        if (collectedRootPubEntity == null) {
            ctx.log.warn(`collected root publication for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let collectEntity = new Collect({
            id: collectData.id,
            collector: collectData.collector,
            collectedCreator: commentedProfileEntity,
            collectedPublication: collectedPubEntity,
            collectedRootCreator: commentedRootProfileEntity,
            collectedRootPublication: collectedRootPubEntity,
            txHash: collectData.txHash,
            timestamp: collectData.timestamp
        })
        NamedEntityBuffer.add('Save', collectEntity)
    }

    const contents = await fetchContentBatch(ctx, contentUris.uris)
    contentUris.pubs.forEach((pubEntity, index) => {
        if (contents[index] == null) return
        for (var field of ['name', 'description', 'content']) {
            let [text, removed] = removeBrokenSurrogate(contents[index][field] || '')
            if (removed) {
                ctx.log.info(`broken surrogate removed from content, content: ${JSON.stringify(contents[index])}`)
                contents[index][field] = text
            }
        }
        pubEntity.content = contents[index]
    })
}
