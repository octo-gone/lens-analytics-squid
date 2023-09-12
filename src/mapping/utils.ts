const brokenSurrogateRegExp = /[\ud800-\udbff]([^\udc00-\udfff])|([^\ud800-\udbff])[\udc00-\udfff]/g

export function removeBrokenSurrogate(x: string): [string, boolean] {
    // for some reason someone removed low- and high-surrogate from UTF-16 character (emoji)
    // this caused issues with typeorm
    // examples:
    //   https://data.lens.phaver.com/api/lens/posts/21cb17c9-4b76-43b1-b782-0c6b075fa64e
    //   https://arweave.net/6ZURJHncx9y5Bj2JOtHYLuPoW45mMe6EZtW_6QfeXK0
    // info:
    //   https://datacadamia.com/data/type/text/surrogate
    if (!brokenSurrogateRegExp.test(x))
        return [x, false]
    return [x.replace(brokenSurrogateRegExp, '$1'), true]
}

export function toDate(value: bigint | number): Date {
    return new Date(Number(value)*1000)
}

export function toID(profileId: bigint | number, pubId: bigint | number): string {
    return `${profileId}_${pubId}`
}
