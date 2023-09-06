import {lens} from './mapping'
import {processor, lensProtocolAddress} from './processor'
import {db} from './db'
import {EntityBuffer} from './entityBuffer'
import {Block} from './model'

processor.run(db, async (ctx) => {
    for (let block of ctx.blocks) {
        EntityBuffer.add(
            new Block({
                id: block.header.id,
                number: block.header.height,
                timestamp: new Date(block.header.timestamp),
            })
        )

        for (let log of block.logs) {
            if (log.address === lensProtocolAddress) {
                lens.parseEvent(ctx, log)
            }
        }
    }

    for (let entities of EntityBuffer.flush()) {
        await ctx.store.insert(entities)
    }
})
