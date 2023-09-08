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

export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                NamedEntityBuffer.add('Collected',
                    new Collect({
                        id: log.id,
                        collectorAddress: e[0].toLowerCase(),
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
                NamedEntityBuffer.add('CommentCreated',
                    new Comment({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        profileIdPointed: e[3],
                        pubIdPointed: e[4],
                        timestamp: toDate(e[10]),
                    })
                )
                break
            }
            case spec.events.Followed.topic: {
                let e = spec.events.Followed.decode(log)
                EntityBuffer.add(
                    new Follow({
                        id: log.id,
                        followerAddress: e[0].toLowerCase(),
                        profileIds: toJSON(e[1]),
                        timestamp: toDate(e[3]),
                    })
                )
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                NamedEntityBuffer.add('MirrorCreated',
                    new Mirror({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        profileIdPointed: e[2],
                        pubIdPointed: e[3],
                        timestamp: toDate(e[7]),
                    })
                )
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                NamedEntityBuffer.add('PostCreated',
                    new Post({
                        id: toID(e[0], e[1]),
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        timestamp: toDate(e[7]),
                    })
                )
                break
            }
            case spec.events.ProfileCreated.topic: {
                let e = spec.events.ProfileCreated.decode(log)
                NamedEntityBuffer.add('ProfileCreated', new Profile({
                    id: e[0].toString(),
                    profileId: e[0],
                    address: e[2].toLowerCase(),
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
    const createdProfiles = NamedEntityBuffer.flush<Profile>('ProfileCreated')
    const updatedProfiles = NamedEntityBuffer.flush<ProfileImageUpdateData>('ProfileImageURISet')
    const createdPosts = NamedEntityBuffer.flush<Post>('PostCreated')
    const createdMirrors = NamedEntityBuffer.flush<Mirror>('MirrorCreated')
    const createdComments = NamedEntityBuffer.flush<Comment>('CommentCreated')
    const createdCollects = NamedEntityBuffer.flush<Collect>('Collected')

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfiles.map(x => x.id),
        ...createdPosts.map(x => x.profileId.toString())
    ]
    createdMirrors.forEach(x => {
        profileIds.push(x.profileId.toString())
        profileIds.push(x.profileIdPointed.toString())
    })
    createdComments.forEach(x => {
        profileIds.push(x.profileId.toString())
        profileIds.push(x.profileIdPointed.toString())
    })
    createdCollects.forEach(x => {
        profileIds.push(x.profileId.toString())
        profileIds.push(x.rootProfileId.toString())
    })
    const profileAddresses = [
        ...createdCollects.map(x => x.collectorAddress.toLowerCase())
    ]

    const storeProfilesByID = await ctx.store.findBy(Profile, {id: In(profileIds)})
    // const storeProfilesByAddress = await ctx.store.findBy(Profile, {address: In(profileAddresses)})
    const profilesByID: Map<string, Profile> = new Map(
        storeProfilesByID.map((profile) => [profile.profileId.toString(), profile])
    )
    // const profilesByAddress: Map<string, Profile> = new Map(
    //     storeProfilesByAddress.map((profile) => [profile.profileId.toString(), profile])
    // )
    const profiles = new Map([
        ...profilesByID,
        // ...profilesByAddress
    ])
    // const profileAddressIdMapping: Map<string, string> = new Map(
    //     Array.from(profiles.values()).map((profile) => [profile.address, profile.profileId.toString()])
    // )
    // ctx.log.warn(profileAddressIdMapping)
    // ctx.log.warn(profilesByAddress)

    for (var profileEntity of createdProfiles) {
        profiles.set(profileEntity.id, profileEntity)
    }

    for (var profile of updatedProfiles) {
        let profileEntity = profiles.get(profile.id)
        if (profileEntity == null) {
            ctx.log.warn(`profile with id '${profile.id}' is missing`)
            continue
        }
        profileEntity.imageUri = profile.imageUri
        profileEntity.updatedAt = profile.updatedAt
    }

    profiles.forEach(x => EntityBuffer.add(x))

    for (var post of createdPosts) {
        let creatorEntity = profiles.get(post.profileId.toString())
        if (creatorEntity == null) {
            ctx.log.warn(`creator profile '${post.profileId.toString()}' for post is missing`)
            continue
        }
        post.creator = creatorEntity
        EntityBuffer.add(post)
        EntityBuffer.add(new Publication({
            id: post.id,
            profileId: post.profileId,
            pubId: post.pubId,
            creator: post.creator,
            variant: PublicationVariant.POST,
            timestamp: post.timestamp
        }))
    }

    for (var mirror of createdMirrors) {
        let creatorEntity = profiles.get(mirror.profileId.toString())
        if (creatorEntity == null) {
            ctx.log.warn(`creator profile '${mirror.profileId.toString()}' for mirror is missing`)
            continue
        }
        let creatorPointedEntity = profiles.get(mirror.profileIdPointed.toString())
        if (creatorPointedEntity == null) {
            ctx.log.warn(`pointed profile '${mirror.profileIdPointed.toString()}' for mirror is missing`)
            continue
        }
        mirror.creator = creatorEntity
        mirror.creatorPointed = creatorPointedEntity
        EntityBuffer.add(mirror)
        EntityBuffer.add(new Publication({
            id: mirror.id,
            profileId: mirror.profileId,
            pubId: mirror.pubId,
            creator: mirror.creator,
            variant: PublicationVariant.MIRROR,
            timestamp: mirror.timestamp
        }))
    }

    for (var comment of createdComments) {
        let creatorEntity = profiles.get(comment.profileId.toString())
        if (creatorEntity == null) {
            ctx.log.fatal(`creator profile '${comment.profileId.toString()}' for comment is missing`)
            continue
        }
        let creatorPointedEntity = profiles.get(comment.profileIdPointed.toString())
        if (creatorPointedEntity == null) {
            ctx.log.fatal(`pointed profile '${comment.profileIdPointed.toString()}' for comment is missing`)
            continue
        }
        comment.creator = creatorEntity
        comment.creatorPointed = creatorPointedEntity
        EntityBuffer.add(comment)
        EntityBuffer.add(new Publication({
            id: comment.id,
            profileId: comment.profileId,
            pubId: comment.pubId,
            creator: comment.creator,
            variant: PublicationVariant.COMMENT,
            timestamp: comment.timestamp
        }))
    }

    for (var collect of createdCollects) {
        // let profileId = profileAddressIdMapping.get(collect.collectorAddress)
        // if (profileId == null) {
        //     ctx.log.warn(`collector profile '${collect.collectorAddress}' for collect is missing`)
        //     continue
        // }
        // let collectorEntity = profiles.get(profileId)
        // if (collectorEntity == null) {
        //     ctx.log.warn(`collector profile '${profileId}' for collect is missing`)
        //     continue
        // }
        let pubCreatorEntity = profiles.get(collect.profileId.toString())
        if (pubCreatorEntity == null) {
            ctx.log.warn(`creator profile '${collect.profileId.toString()}' for collect is missing`)
            continue
        }
        let rootCreatorEntity = profiles.get(collect.rootProfileId.toString())
        if (rootCreatorEntity == null) {
            ctx.log.warn(`root profile '${collect.rootProfileId.toString()}' for collect is missing`)
            continue
        }
        collect.pubCreator = pubCreatorEntity
        collect.rootCreator = rootCreatorEntity
        // collect.collector = collectorEntity
        EntityBuffer.add(collect)
    }
}
