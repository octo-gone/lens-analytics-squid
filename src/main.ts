import {lens} from './mapping'
import {processor} from './processor'
import {db} from './db'
import {NamedEntityBuffer} from './entityBuffer'


processor.run(db, async (ctx) => {
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            switch (log.address) {
                case lens.lensProtocolAddress: {
                    lens.parseEvent(ctx, log)
                    break
                }
            }
        }
    }

    await lens.mergeData(ctx)

    for (let entities of NamedEntityBuffer.flush("Save")) {
        await ctx.store.save(entities)
    }
})