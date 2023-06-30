import React from "react";
import getDataMap, {getCursorPerFilter, GetCursorPerFilterInput} from "@/utils/mongo/query";
import { returnDocumentsSlice } from "@/utils/mongo/format";
import filterUpdateLink, {getCurrentIndexRange, ModifierState, parseFilterURL} from "@/utils/url/filter";
import { documentLimitDefault } from "@/utils/config";
import NavTable from "@/components/NavDocs/table";
import SelectTimeRange from "@/utils/time/select";


// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0


export function removeFilter(modifierState: ModifierState, filterState: GetCursorPerFilterInput)
    : Array<React.ReactElement> {
    let removeLinks: Array<React.ReactElement> = []
    for (let filterName of Object.keys(filterState)) {
        let linksThisType: Array<React.ReactNode> | undefined = undefined
        switch (filterName) {
            case "action_type":
                const filterValuesActionType = filterState.action_type
                if (filterValuesActionType !== undefined) {
                    linksThisType = Array.from(filterValuesActionType).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'action_type', filterValue, false)
                    })
                }
                break
            case "timestamp":
                const filterValuesTimestamp = filterState.timestamp
                if (filterValuesTimestamp !== undefined) {
                    linksThisType = Array.from(filterValuesTimestamp).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'timestamp', filterValue, false)
                    })
                }
                break
            case "coarse_timestamp":
                const filterValuesCoarseTimestamp = filterState.timestamp_coarse
                if (filterValuesCoarseTimestamp !== undefined) {
                    linksThisType = Array.from(filterValuesCoarseTimestamp).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'timestamp_coarse', filterValue, false)
                    })
                }
                break
            case "ufm_number":
                const filterValuesUfmNumber = filterState.ufm_number
                if (filterValuesUfmNumber !== undefined) {
                    linksThisType = Array.from(filterValuesUfmNumber).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'ufm_number', filterValue, false)
                    })
                }
                break
            case "ufm_letter":
                const filterValuesUfmLetter = filterState.ufm_letter
                if (filterValuesUfmLetter !== undefined) {
                    linksThisType = Array.from(filterValuesUfmLetter).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'ufm_letter', filterValue, false)
                    })
                }
                break
            case "timestamp_range":
                const filterValuesTimestampRange = filterState.timestamp_range
                if (filterValuesTimestampRange !== undefined) {
                    console.log('filterValuesTimestampRange', filterValuesTimestampRange)
                    linksThisType = Array.from(filterValuesTimestampRange).map((filterValue) => {
                        return filterUpdateLink(modifierState, filterState, 'timestamp_range', filterValue, false)
                    })
                }
        }
        if (linksThisType !== undefined) {
            removeLinks.push(
                <div className="flex flex-col" key={filterName + "false"}>
                    <h2 className={`text-3xl text-tvblue font-semibold`}>{filterName}:</h2>
                    { linksThisType }
                </div>
            )
        }
    }
    return removeLinks
}
export default async function Page({ params }: { params: { query: Array<string> } }) {
    // parse the filter state and modifier(s) from the URL
    const [modifierState, filterState] = parseFilterURL(params.query, true)
    // Get the data states from the database
    const valuesMap = await getDataMap()
    // Parse Action-types from the database
    const actionTypes = valuesMap.get("actionTypes")
    const availableActionTypes = actionTypes.filter((actionType: string) => {
        const filterValues = filterState['action_type']
        if (filterValues !== undefined) {
            return !filterValues.has(actionType)
        }
        return true
    })
    // Parse Time data from the database
    const coarseTimestamps = valuesMap.get("coarseTimestamps")
    const timestamps = valuesMap.get("timestamps")
    let timestampDatabaseMin: number | undefined = parseInt(timestamps[0])
    if (Number.isNaN(timestampDatabaseMin)) {
        timestampDatabaseMin = undefined
    }
    let timestampDataBaseMax: number | undefined = parseInt(timestamps[timestamps.length - 1])
    if (Number.isNaN(timestampDataBaseMax)) {
        timestampDataBaseMax = undefined
    }
    // get the cursor for the current filter state
    const dataCursor = await getCursorPerFilter(filterState)
    // get a slice of the available documents
    let [startIndex, endIndex] = getCurrentIndexRange(modifierState)
    const [docArray, maxIndex] = await returnDocumentsSlice(startIndex, endIndex, dataCursor)
    endIndex = Math.min(endIndex, maxIndex)
    const indexKeyString = startIndex.toString() + "_" + endIndex.toString()
    return (
        <main className="flex flex-col items-left justify-between px-24 pt-24 pb-2 h-screen">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-lg lg:flex">
                <p className="text-4xl text-tvgrey fixed left-0 top-0 flex w-full justify-center border-b border-tvyellow bg-gradient-to-b from-tvpurple pb-6 pt-8 backdrop-blur-2xl">
                    TeleView Navigation and Search Page
                </p>
            </div>
            <div className="flex flex-row h-20">
                <div className="flex flex-col w-1/3" key={'current_filters_header'}>
                    <h1 className="text-4xl font-bold text-tvgreen pt-10">Current Filters:</h1>
                </div>
                <div className="flex flex-col w-1/3" key={'filter_action_type_header'}>
                    <h1 className="text-4xl font-bold text-tvorange pt-10">Add Filters:</h1>
                </div>
                <div className="flex flex-col w-1/3" key={'filter_date_range'}>
                    <h1 className="text-4xl font-bold text-tvorange pt-10">Add Time Range:</h1>
                </div>
            </div>
            <div className="flex flex-row h-60 overflow-auto">
                <div className="flex flex-col w-1/3">
                    {removeFilter(modifierState, filterState)}
                </div>

                <div className="flex flex-col w-1/3" key={indexKeyString + 'action_type' + "false"}>
                    {availableActionTypes.map((actionType: string) => {
                        return filterUpdateLink(modifierState, filterState, 'action_type', actionType, true)
                    })}
                </div>
                <div className="flex flex-col w-1/3" key={"TimeRangeFilterSelect"}>
                    {<SelectTimeRange
                        suggestedMin={timestampDatabaseMin}
                        suggestedMax={timestampDataBaseMax}
                        filterState={filterState}
                        modifierState={modifierState}
                    />}
                </div>
            </div>
            <div className="h-3/5">
                {<NavTable
                    docArray={docArray}
                    modifierState={modifierState}
                    filterState={filterState}
                    deltaIndex={documentLimitDefault}
                    viewIndexMin={startIndex}
                    viewIndexMax={endIndex}
                    indexMax={maxIndex}
                />}
            </div>
        </main>
    )
}