import {DataHandlerContext} from '@subsquid/evm-processor'
import {toJSON} from '@subsquid/util-internal-json'
import {Store} from '../db'
import {EntityBuffer} from '../entityBuffer'
import {Collect, Comment, Follow, Mirror, Post, Profile} from '../model'
import * as spec from '../abi/Lens'
import {Log, lensProtocolAddress} from '../processor'


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
                EntityBuffer.add(
                    new Post({
                        id: log.id,
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        timestamp: bigintToDate(e[7]),
                    })
                )
                break
            }
            case spec.events.ProfileCreated.topic: {
                let e = spec.events.ProfileCreated.decode(log)
                EntityBuffer.add(
                    new Profile({
                        id: log.id,
                        profileId: e[0],
                        address: e[2],
                        handle: e[3],
                        imageUri: e[4],
                        timestamp: bigintToDate(e[8]),
                    })
                )
                break
            }
            case spec.events.ProfileImageURISet.topic: {
                // let e = spec.events.ProfileImageURISet.decode(log)
                // EntityBuffer.add(
                //     new LensEventProfileImageUriSet({
                //         id: log.id,
                //         blockNumber: log.block.height,
                //         blockTimestamp: new Date(log.block.timestamp),
                //         transactionHash: log.transactionHash,
                //         contract: log.address,
                //         eventName: 'ProfileImageURISet',
                //         profileId: e[0],
                //         imageUri: e[1],
                //         timestamp: e[2],
                //     })
                // )
                break
            }
        }
    }
    catch (error) {
        ctx.log.error({error, blockNumber: log.block.height, blockHash: log.block.hash, lensProtocolAddress}, `Unable to decode event "${log.topics[0]}"`)
    }
}
