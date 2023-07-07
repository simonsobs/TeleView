
import React from "react";
import getDataMap, { getCursorPerFilter } from "@/utils/mongo/query";
import { returnDocumentsSlice } from "@/utils/mongo/format";
import { getCurrentIndexRange, parseFilterURL } from "@/utils/url/filter";
import { TELEVIEW_VERBOSE } from "@/utils/config";

import QueryPage from "@/components/query";


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
    const [docArray, maxIndex] = await returnDocumentsSlice(startIndex, endIndex, dataCursor)
    return (<QueryPage
        modifierState={modifierState}
        filterState={filterState}
        docArray={docArray}
        availableActionTypes={availableActionTypes}
        maxIndex={maxIndex}
        timestampDatabaseMin={timestampDatabaseMin}
        timestampDatabaseMax={timestampDataBaseMax}
    />)
}