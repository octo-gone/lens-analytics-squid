export function removeBrokenSurrogate(x: string): [string, boolean] {
    return [x.replace(/[\ud800-\udbff][^\udc00-\udfff]/g, ''), /[\ud800-\udbff][^\udc00-\udfff]/g.test(x)]
}

export function toDate(value: bigint): Date {
    return new Date(Number(value)*1000)
}

export function toID(profileId: bigint, pubId: bigint): string {
    return `${profileId}_${pubId}`
}
