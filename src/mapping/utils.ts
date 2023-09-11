const brokenSurrogateRegExp = /[\ud800-\udbff][^\udc00-\udfff]/g

export function removeBrokenSurrogate(x: string): [string, boolean] {
    // for some reason someone removed low-surrogate from UTF-16 character (emoji)
    // this caused issues with typeorm
    // example: https://data.lens.phaver.com/api/lens/posts/21cb17c9-4b76-43b1-b782-0c6b075fa64e
    // info: https://datacadamia.com/data/type/text/surrogate
    return [x.replace(brokenSurrogateRegExp, ''), brokenSurrogateRegExp.test(x)]
}

export function toDate(value: bigint): Date {
    return new Date(Number(value)*1000)
}

export function toID(profileId: bigint, pubId: bigint): string {
    return `${profileId}_${pubId}`
}
