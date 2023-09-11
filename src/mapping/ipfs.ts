import {DataHandlerContext} from '@subsquid/evm-processor';
import {Store} from '../db'
import {HttpClient} from '@subsquid/util-internal-http-client'


const ipfsClient = new HttpClient({
    baseUrl: process.env.IPFS_BASE_URL,
    headers: {
        'content-type': 'application/json',
    },
    retryAttempts: 3,
})

const httpClient = new HttpClient({
    headers: {
        'content-type': 'application/json',
    },
    retryAttempts: 3,
})

const ipfsCIDRegExp = /^\S*(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$/

export async function fetchContent(
    ctx: DataHandlerContext<Store>,
    uri: string
): Promise<any | null> {
    try {
        let data: any
        if (uri.startsWith('ipfs://')) {
            data = await ipfsClient.get('ipfs/' + ipfsCIDRegExp.exec(uri)![1])
        } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
            if (uri.includes('ipfs/')) {
                data = await ipfsClient.get('ipfs/' + ipfsCIDRegExp.exec(uri)![1])
            } else {
                data = await httpClient.get(uri).catch(() => undefined)
            }
        } else if (/^[a-zA-Z0-9]+$/.test(uri)) {
            data = await ipfsClient.get('ipfs/' + uri)
        } else {
            throw new Error(`unexpected url "${uri}"`)
        }

        return data
    } catch (e) {
        ctx.log.warn(
            `error while fetching: ${uri}, exception: ${(e as Error).message}`
        )
    }
    return null
}

const IPFS_BATCH_SIZE = 100

export async function fetchContentBatch(
    ctx: DataHandlerContext<Store>,
    items: string[]
): Promise<any[]> {
    let itemsMetadata: any[] = []
    for (let i = 0; i < items.length; i += IPFS_BATCH_SIZE) {
        let res = await Promise.all(
            items.slice(i, IPFS_BATCH_SIZE).map(async (uri) => fetchContent(ctx, uri))
        )
        itemsMetadata.push(...res)
    }
    return itemsMetadata
}