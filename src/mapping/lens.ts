import {DataHandlerContext} from '@subsquid/evm-processor'
import {toJSON} from '@subsquid/util-internal-json'
import {Store} from '../db'
import {EntityBuffer, NamedEntityBuffer} from '../entityBuffer'
import {Collect, Comment, Follow, Mirror, Post, Profile} from '../model'
import * as spec from '../abi/Lens'
import {Log, lensProtocolAddress} from '../processor'
import {ProfilePatchData} from './types'
import {In} from 'typeorm'


function bigintToDate(value: bigint): Date {
    return new Date(Number(value)*1000)
}

export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                EntityBuffer.add(
                    new Collect({
                        id: log.id,
                        collector: e[0],
                        profileId: e[1],
                        pubId: e[2],
                        rootProfileId: e[3],
                        rootPubId: e[4],
                        timestamp: bigintToDate(e[6]),
                    })
                )
                break
            }
            case spec.events.CommentCreated.topic: {
                let e = spec.events.CommentCreated.decode(log)
                EntityBuffer.add(
                    new Comment({
                        id: log.id,
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        profileIdPointed: e[3],
                        pubIdPointed: e[4],
                        timestamp: bigintToDate(e[10]),
                    })
                )
                break
            }
            case spec.events.Followed.topic: {
                let e = spec.events.Followed.decode(log)
                EntityBuffer.add(
                    new Follow({
                        id: log.id,
                        follower: e[0],
                        profileIds: toJSON(e[1]),
                        timestamp: bigintToDate(e[3]),
                    })
                )
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                EntityBuffer.add(
                    new Mirror({
                        id: log.id,
                        profileId: e[0],
                        pubId: e[1],
                        profileIdPointed: e[2],
                        pubIdPointed: e[3],
                        timestamp: bigintToDate(e[7]),
                    })
                )
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                NamedEntityBuffer.add('PostCreated',
                    new Post({
                        id: log.id,
                        pubId: e[1],
                        profileId: e[0],
                        contentUri: e[2],
                        timestamp: bigintToDate(e[7]),
                    })
                )
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
                    createdAt: bigintToDate(e[8]),
                    updatedAt: bigintToDate(e[8]),
                }))
                break
            }
            case spec.events.ProfileImageURISet.topic: {
                let e = spec.events.ProfileImageURISet.decode(log)
                NamedEntityBuffer.add<ProfilePatchData>('ProfileImageURISet', {
                    id: e[0].toString(),
                    profileId: e[0],
                    imageUri: e[1],
                    updatedAt: bigintToDate(e[2]),
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
    const updatedProfiles = NamedEntityBuffer.flush<ProfilePatchData>('ProfileImageURISet')
    const createdPosts = NamedEntityBuffer.flush<Post>('PostCreated')

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfiles.map(x => x.id),
        ...createdPosts.map(x => x.profileId.toString())
    ]

    const profiles: Map<string, Profile> = new Map(
        (await ctx.store.findBy(Profile, {id: In([...profileIds])})).map((profile) => [
            profile.profileId.toString(),
            profile,
        ])
    )

    for (var profileEntity of createdProfiles) {
        profiles.set(profileEntity.id, profileEntity)
    }

    for (var profile of updatedProfiles) {
        let profileEntity = profiles.get(profile.id)
        if (profileEntity == null) {
            ctx.log.warn(`profile with id '${profile.id}' is missing`)
            continue
        }
        profileEntity.imageUri = profile.imageUri || ''
        profileEntity.updatedAt = profile.updatedAt
    }

    profiles.forEach(x => EntityBuffer.add(x))

    for (var post of createdPosts) {
        let profileEntity = profiles.get(post.profileId.toString())
        if (profileEntity == null) {
            ctx.log.warn(`profile with id '${post.profileId.toString()}' is missing`)
            continue
        }
        post.creator = profileEntity
        EntityBuffer.add(post)
    }
}
