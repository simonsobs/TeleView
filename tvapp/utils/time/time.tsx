import {minIsoDate} from "@/utils/config";

export function nowTimestamp (): number {
    return Math.floor(Date.now() / 1000)
}


export function timestampToIsoString(timestamp: number): string {
    const date = new Date(timestamp * 1000)
    let isoStringFull: string = ""
    try {
        isoStringFull = date.toISOString()
    } catch (e) {
        if (e instanceof RangeError) {
            return minIsoDate
        }
    }
    return isoStringFull.split(".")[0]
}


export function isoStringToTimestamp(isoString: string): number {
    if (isoString === "") {
        return 0
    }
    const date = new Date(isoString + 'Z')
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


function hasOverlap(range1: [number, number], range2: [number, number]): boolean {
    let [start1, end1, start2, end2] = [...range1, ...range2]
    if (start1 > end1) {
        [start1, end1] = [end1, start1]
    }
    if (start2 > end2) {
        [start2, end2] = [end2, start2]
    }
    return !(end1 < start2 || end2 < start1)
}

function mergeRanges(range1: [number, number], range2: [number, number]): [number, number] {
    let [start1, end1, start2, end2] = [...range1, ...range2]
    if (start1 > end1) {
        [start1, end1] = [end1, start1]
    }
    if (start2 > end2) {
        [start2, end2] = [end2, start2]
    }
    return [Math.min(start1, start2), Math.max(end1, end2)]
}


export function simplifyRanges(timestampRanges: Array<[number, number]>): Array<[number, number]> {
    /* Find the overlap between all ranges and simplify to the smallest number of ranges */
    // enforce that the start time is less than the end time
    const minMaxCheckedRanges = timestampRanges.map(function ([start, end]): [number, number] {
        if (start > end) {
            return [end, start]
        } else {
            return [start, end]
        }
    })
    // remove any values where the start time is equal to the end time
    const nonZeroRanges = minMaxCheckedRanges.filter(function ([start, end]): boolean {
        return start !== end
    })
    // Sort the ranges by start time reversed (largest to smallest)
    const sortedRanges = nonZeroRanges.sort(function(a, b){return b[0] - a[0]})
    // There can be duplicated ranges at this point, but those will be eliminated in the range overlap check
    let noOverLapRanges: Array<[number, number]> = []
    let loopRanges: Array<[number, number]> = [...sortedRanges]
    while (loopRanges.length > 1) {
        const currentRange = loopRanges.pop()!
        let overlapFound = false
        for (let i = 0; i < loopRanges.length; i++) {
            const compareRange = loopRanges[i]
            if (hasOverlap(currentRange, compareRange)) {
                // push the merged range back onto the stack of ranges to check
                loopRanges[i] = mergeRanges(currentRange, compareRange)
                overlapFound = true
                break
            }
        }
        if (!overlapFound) {
            noOverLapRanges.push(currentRange)
        }
    }
    // There is no for the last range to when only a single rage was given
    if (loopRanges.length === 1) {
        noOverLapRanges.push(loopRanges[0])
    }
    return noOverLapRanges
}
