'use client'


import React, { useContext } from "react";
import MenuBar, {MenuBarNav} from "@/components/menu/menu_bar";
import filterUpdateLink, {getCurrentIndexRange, ModifierState} from "@/utils/url/filter";
import SelectTimeRange from "@/utils/time/select";
import NavTable from "@/components/NavDocs/table";
import {documentLimitDefault, TELEVIEW_VERBOSE} from "@/utils/config";
import QueryProvider, { QueryContext } from "@/states/query";
import {GetCursorPerFilterInput} from "@/utils/mongo/query";
import {returnDocumentsSlice} from "@/utils/mongo/format";
import mongo from "mongodb";


type QueryClientInput = {
    modifierState: ModifierState,
    filterState: GetCursorPerFilterInput
    docArray: Array<mongo.Document>
    availableActionTypes: Array<string>
    maxIndex: number
    timestampDatabaseMin: number | undefined
    timestampDatabaseMax: number | undefined

}
export function QueryClient({modifierState, filterState, docArray, availableActionTypes, maxIndex, timestampDatabaseMin, timestampDatabaseMax}: QueryClientInput) {
    // get a slice of the available documents
    let [startIndex, endIndex] = getCurrentIndexRange(modifierState)
    if (TELEVIEW_VERBOSE) {
        console.log("modifierState:", modifierState)
        console.log("startIndex:", startIndex, "endIndex:", endIndex)
    }
    endIndex = Math.min(endIndex, maxIndex)
    const indexKeyString = startIndex.toString() + "_" + endIndex.toString()
    return (
        <main className="h-screen w-screen">
            <div className="z-50 w-full h-10 items-center font-mono text-lg">
                <MenuBar
                    modifierState={modifierState}
                    filterState={filterState}
                />
            </div>
            <div className="z-0 flex flex-row h-20">
                <div className="flex flex-col w-1/3" key={'current_filters_header'}>
                    <h1 className="text-4xl font-bold text-tvgreen pt-10">Empty Section:</h1>
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


                </div>

                <div className="flex flex-col w-1/3" key={indexKeyString + 'action_type' + "false"}>
                    {availableActionTypes.map((actionType: string) => {
                        return filterUpdateLink(modifierState, filterState, 'action_type', actionType, true)
                    })}
                </div>
                <div className="flex flex-col w-1/3" key={"TimeRangeFilterSelect"}>
                    <SelectTimeRange
                        suggestedMin={timestampDatabaseMin}
                        suggestedMax={timestampDatabaseMax}
                        filterState={filterState}
                        modifierState={modifierState}
                    />
                </div>
            </div>
            <div className="h-3/5 z-0">
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

export default function QueryPage({modifierState, filterState, docArray, availableActionTypes, maxIndex, timestampDatabaseMin, timestampDatabaseMax} : QueryClientInput): React.ReactElement {
    return (
        <QueryProvider>
            <QueryClient
                modifierState={modifierState}
                filterState={filterState}
                docArray={docArray}
                availableActionTypes={availableActionTypes}
                maxIndex={maxIndex}
                timestampDatabaseMin={timestampDatabaseMin}
                timestampDatabaseMax={timestampDatabaseMax}
            />
        </QueryProvider>
    )

}