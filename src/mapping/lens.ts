import {DataHandlerContext} from '@subsquid/evm-processor'
import {toJSON} from '@subsquid/util-internal-json'
import {Store} from '../db'
import {EntityBuffer} from '../entityBuffer'
import {LensEventCollected, LensEventCommentCreated, LensEventFollowed, LensEventMirrorCreated, LensEventPostCreated, LensEventProfileCreated, LensEventProfileImageUriSet} from '../model'
import * as spec from '../abi/Lens'
import {Log, lensProtocolAddress} from '../processor'


export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                EntityBuffer.add(
                    new LensEventCollected({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'Collected',
                        collector: e[0],
                        profileId: e[1],
                        pubId: e[2],
                        rootProfileId: e[3],
                        rootPubId: e[4],
                        collectModuleData: e[5],
                        timestamp: e[6],
                    })
                )
                break
            }
            case spec.events.CommentCreated.topic: {
                let e = spec.events.CommentCreated.decode(log)
                EntityBuffer.add(
                    new LensEventCommentCreated({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'CommentCreated',
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        profileIdPointed: e[3],
                        pubIdPointed: e[4],
                        referenceModuleData: e[5],
                        collectModule: e[6],
                        collectModuleReturnData: e[7],
                        referenceModule: e[8],
                        referenceModuleReturnData: e[9],
                        timestamp: e[10],
                    })
                )
                break
            }
            case spec.events.Followed.topic: {
                let e = spec.events.Followed.decode(log)
                EntityBuffer.add(
                    new LensEventFollowed({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'Followed',
                        follower: e[0],
                        profileIds: toJSON(e[1]),
                        followModuleDatas: toJSON(e[2]),
                        timestamp: e[3],
                    })
                )
                break
            }
            case spec.events.MirrorCreated.topic: {
                let e = spec.events.MirrorCreated.decode(log)
                EntityBuffer.add(
                    new LensEventMirrorCreated({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'MirrorCreated',
                        profileId: e[0],
                        pubId: e[1],
                        profileIdPointed: e[2],
                        pubIdPointed: e[3],
                        referenceModuleData: e[4],
                        referenceModule: e[5],
                        referenceModuleReturnData: e[6],
                        timestamp: e[7],
                    })
                )
                break
            }
            case spec.events.PostCreated.topic: {
                let e = spec.events.PostCreated.decode(log)
                EntityBuffer.add(
                    new LensEventPostCreated({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'PostCreated',
                        profileId: e[0],
                        pubId: e[1],
                        contentUri: e[2],
                        collectModule: e[3],
                        collectModuleReturnData: e[4],
                        referenceModule: e[5],
                        referenceModuleReturnData: e[6],
                        timestamp: e[7],
                    })
                )
                break
            }
            case spec.events.ProfileCreated.topic: {
                let e = spec.events.ProfileCreated.decode(log)
                EntityBuffer.add(
                    new LensEventProfileCreated({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'ProfileCreated',
                        profileId: e[0],
                        creator: e[1],
                        to: e[2],
                        handle: e[3],
                        imageUri: e[4],
                        followModule: e[5],
                        followModuleReturnData: e[6],
                        followNfturi: e[7],
                        timestamp: e[8],
                    })
                )
                break
            }
            case spec.events.ProfileImageURISet.topic: {
                let e = spec.events.ProfileImageURISet.decode(log)
                EntityBuffer.add(
                    new LensEventProfileImageUriSet({
                        id: log.id,
                        blockNumber: log.block.height,
                        blockTimestamp: new Date(log.block.timestamp),
                        transactionHash: log.transactionHash,
                        contract: log.address,
                        eventName: 'ProfileImageURISet',
                        profileId: e[0],
                        imageUri: e[1],
                        timestamp: e[2],
                    })
                )
                break
            }
        }
    }
    catch (error) {
        ctx.log.error({error, blockNumber: log.block.height, blockHash: log.block.hash, lensProtocolAddress}, `Unable to decode event "${log.topics[0]}"`)
    }
}
