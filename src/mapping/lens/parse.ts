import {DataHandlerContext} from '@subsquid/evm-processor'
import {Store} from '../../db'
import {NamedEntityBuffer} from '../../entityBuffer'
import * as spec from '../../abi/Lens'
import * as specHub from '../../abi/LensHub'
import {Log} from '../../processor'
import {ProfileImageUpdateData, PublicationData, CollectData, ProfileTransferData} from '../types'
import {Mirror, Post, Comment, PublicationVariant, Profile, Follow} from '../../model'
import {toID, toDate} from '../utils'
import { lensProtocolAddress } from '.'


export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
        switch (log.topics[0]) {
            case spec.events.Collected.topic: {
                let e = spec.events.Collected.decode(log)
                NamedEntityBuffer.add<CollectData>('PublicationCollected', {
                    id: log.id,
                    nftOwnerAddress: e[0],
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
                    nftOwnerAddress: e[0],
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
