import React from "react";
import getDataMap, { getCursorPerFilter } from "@/utils/mongo/query";
import { getFilterValues, returnDocumentsSlice } from "@/utils/mongo/format";
import filterUpdateLink, {getCurrentIndexRange, parseFilterURL, documentLimitDefault} from "@/components/MenuLinks/filter";
import actionLink from "@/components/MenuLinks/actions";
import NavTable from "@/components/NavDocs/table";





// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0




export default async function Page({ params }: { params: { query: Array<string> } }) {
    // parse the filter state and modifier(s) from the URL
    const [modifierState, filterState] = parseFilterURL(params.query, true)

    const valuesMap = await getDataMap()
    const actionTypes = valuesMap.get("actionTypes")
    const availableActionTypes = actionTypes.filter((actionType: string) => {
        const filterValues = filterState.get('action_type')
        if (filterValues !== undefined) {
            return !filterValues.has(actionType)
        }
        return true
    })
    // const coarseTimeStamps = valuesMap.get("coarseTimeStamps")


    let timestamp = undefined
    const filterTimestamp = filterState.get('timestamp')
    if (filterTimestamp !== undefined) {
        timestamp = Array.from(filterTimestamp)
    }

    const dataCursor = await getCursorPerFilter(
        getFilterValues('action_type', filterState),
        getFilterValues('timestamp', filterState),
        getFilterValues('timestamp_coarse', filterState),
        getFilterValues('ufm_letter', filterState),
        getFilterValues('ufm_number', filterState),
        )


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
            <div className="flex flex-row h-2/5 overflow-auto">
                <div className="flex flex-col w-1/4 pt-10 pr-24">
                    <h1 className="text-4xl font-bold text-tvgreen ">Select by Action:</h1>
                    {actionTypes.map((actionType: string) => actionLink(actionType, "by_action"))}
                </div>
                <div className="flex flex-col w-3/4">
                    <div className="flex flex-row">
                        <div className="flex flex-col w-1/3">
                            <h1 className="text-4xl font-bold text-tvgreen pt-10">Current Filters:</h1>
                        </div>
                        <div className="flex flex-col w-1/3" key={indexKeyString + 'action_type' + "false"}>
                            <h1 className="text-4xl font-bold text-tvorange pt-10">Add Filters:</h1>
                        </div>
                    </div>
                    <div className="flex flex-row">
                        <div className="flex flex-col w-1/3">
                            {filterState.size === 0 ?
                                <h2 className={`mb-3 text-2xl text-tvblue font-semibold`}>No Filters Selected, All Data Shown</h2>
                                :
                                Array.from(filterState.entries()).map(([filterName, filterValues]) => {
                                    return (
                                        <div className="flex flex-col" key={indexKeyString + filterName + "false"}>
                                            <h2 className={`text-3xl text-tvblue font-semibold`}>{filterName}:</h2>
                                            {Array.from(filterValues.entries()).map(([filterValue, filterValueState]) => {
                                                return (filterUpdateLink(modifierState, filterState, filterName, filterValue, false)
                                                )
                                            })}
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className="flex flex-col w-1/3" key={indexKeyString + 'action_type' + "false"}>
                            {availableActionTypes.map((actionType: string) => {
                                return filterUpdateLink(modifierState, filterState, 'action_type', actionType, true)
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row h-3/5">
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