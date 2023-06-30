export function nowTimestamp (): number {
    return Math.floor(Date.now() / 1000)
}


export function timestampToIsoString(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    const isoStringFull = date.toISOString()
    return isoStringFull.split(".")[0]
}


export function isoStringToTimestamp(isoString: string): number {
    const date = new Date(isoString + '.000Z')
    return date.getTime() / 1000
}


export function convertCoarseTimestamp(timestamp: number): number {
    let timestampAsString: string = timestamp.toString()
    let timestampFull: number
    if (timestampAsString.length === 5) {
        // This is a coarse (approximately per-day) unix timestamp, so we need to add 5 zeros to the end
        timestampAsString = timestampAsString + '00000'
        timestampFull = parseInt(timestampAsString)
    } else {
        timestampFull = timestamp
    }
    return timestampFull
}
