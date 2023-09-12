import {lens} from './mapping'
import {processor, lensProtocolAddress} from './processor'
import {db} from './db'
import {NamedEntityBuffer} from './entityBuffer'

processor.run(db, async (ctx) => {
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === lensProtocolAddress) {
                lens.parseEvent(ctx, log)
            }
        }
    }
    await lens.mergeData(ctx)

    for (let entities of NamedEntityBuffer.flush("Save")) {
        await ctx.store.save(entities)
    }
})