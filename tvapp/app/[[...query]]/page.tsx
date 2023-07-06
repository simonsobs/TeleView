
import React from "react";
import getDataMap, { getCursorPerFilter } from "@/utils/mongo/query";
import { returnDocumentsSlice } from "@/utils/mongo/format";
import filterUpdateLink, { getCurrentIndexRange, parseFilterURL } from "@/utils/url/filter";
import { documentLimitDefault, TELEVIEW_VERBOSE } from "@/utils/config";
import NavTable from "@/components/NavDocs/table";
import SelectTimeRange from "@/utils/time/select";
import MenuBar from "@/components/menu/menu_bar";


// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0


export default async function Page({ params }: { params: { query: Array<string> } }) {
    // parse the filter state and modifier(s) from the URL
    const [modifierState, filterState] = parseFilterURL(params.query, TELEVIEW_VERBOSE)
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
    if (TELEVIEW_VERBOSE) {
        console.log("modifierState:", modifierState)
        console.log("startIndex:", startIndex, "endIndex:", endIndex)
    }
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
                    <MenuBar
                        modifierState={modifierState}
                        filterState={filterState}
                    />

                </div>

                <div className="flex flex-col w-1/3" key={indexKeyString + 'action_type' + "false"}>
                    {availableActionTypes.map((actionType: string) => {
                        return filterUpdateLink(modifierState, filterState, 'action_type', actionType, true)
                    })}
                </div>
                <div className="flex flex-col w-1/3" key={"TimeRangeFilterSelect"}>
                    <SelectTimeRange
                        suggestedMin={timestampDatabaseMin}
                        suggestedMax={timestampDataBaseMax}
                        filterState={filterState}
                        modifierState={modifierState}
                    />
                </div>
            </div>
            <div className="h-3/5">
                <NavTable
                    docArray={docArray}
                    modifierState={modifierState}
                    filterState={filterState}
                    deltaIndex={documentLimitDefault}
                    viewIndexMin={startIndex}
                    viewIndexMax={endIndex}
                    indexMax={maxIndex}
                />
            </div>
        </main>
    )
}