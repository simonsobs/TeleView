import {FilterState} from "@/utils/mongo/request_data";

export function streamIDToUfmNumber(stream_id: string): number {
    const aArray = stream_id.split('v')
    // get the last element of the array
    const aNumberString = aArray.pop()
    let aNumber = -1
    if (aNumberString) {
        aNumber = parseInt(aNumberString)
    }
    return aNumber
}


export function findAvailableStrings(allStringValues: Array<string>, filteredStringValues: Set<string> | undefined): Array<string> {
    return allStringValues.filter((actionType: string) => {
        if (filteredStringValues !== undefined) {
            return !filteredStringValues.has(actionType)
        }
        return true
    })
}
