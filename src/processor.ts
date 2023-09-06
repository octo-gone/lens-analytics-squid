import {EvmBatchProcessor, EvmBatchProcessorFields, BlockHeader, Log as _Log, Transaction as _Transaction} from '@subsquid/evm-processor'
import {lookupArchive} from '@subsquid/archive-registry'
import * as lensAbi from './abi/Lens'

export const lensProtocolAddress = '0xdb46d1dc155634fbc732f92e853b10b288ad5a1d'

export const processor = new EvmBatchProcessor()
    .setDataSource({
        archive: lookupArchive('polygon', {type: 'EVM', release: 'ArrowSquid'}),
        chain: process.env.POLYGON_RPC_ENDPOINT
    })
    .setFinalityConfirmation(200)
    .setFields({
        log: {
            topics: true,
            data: true,
            transactionHash: true,
        },
        transaction: {
            hash: true,
            input: true,
            from: true,
            value: true,
            status: true,
        }
    })
    .setBlockRange({
        from: 28_000_000
    })
    .addLog({
        address: [lensProtocolAddress],
        topic0: [
            lensAbi.events.Collected.topic,
            lensAbi.events.CommentCreated.topic,
            lensAbi.events.Followed.topic,
            lensAbi.events.MirrorCreated.topic,
            lensAbi.events.PostCreated.topic,
            lensAbi.events.ProfileCreated.topic,
            lensAbi.events.ProfileImageURISet.topic,
        ],
    })

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
