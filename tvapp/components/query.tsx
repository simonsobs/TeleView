'use client'

import mongo from "mongodb";
import React, { useContext } from "react";

import MenuBar from "@/components/menu/menu_bar";
import SelectTimeRange from "@/utils/time/select";
import NavTable from "@/components/NavDocs/table";
import QueryProvider, { QueryContext } from "@/states/query";
import { GetCursorPerFilterInput } from "@/utils/mongo/query";
import Drawer, { ClickBarrier } from "@/components/menu/drawer";
import { RemoveFilterMenu } from "@/components/menu/remove_filters";
import { documentLimitDefault } from "@/utils/config";
import filterUpdateLink, { getCurrentIndexRange, ModifierState } from "@/utils/url/filter";


type QueryClientInput = {
    modifierState: ModifierState,
    filterState: GetCursorPerFilterInput
    docArray: Array<mongo.Document>
    availableActionTypes: Array<string>
    maxIndex: number
    timestampDatabaseMin: number | undefined
    timestampDatabaseMax: number | undefined

}
export function QueryClient(
    {
        modifierState,
        filterState,
        docArray,
        availableActionTypes,
        maxIndex,
        timestampDatabaseMin,
        timestampDatabaseMax
    }: QueryClientInput) {

    const {
        isRemoveFilterMenuOpen,
        isAnyMenuOpen,
        closeAllMenus
    } = useContext(QueryContext)
    let [startIndex, endIndex] = getCurrentIndexRange(modifierState)
    endIndex = Math.min(endIndex, maxIndex)
    const indexKeyString = startIndex.toString() + "_" + endIndex.toString()

    const menuViewer = (): React.ReactElement => {
        return (
            <>
                <ClickBarrier
                    onClick={closeAllMenus}
                />
                {isRemoveFilterMenuOpen && (
                    <div className="h-full w-auto absolute top-0 left-0 z-40">
                        <Drawer
                            closeCallback={closeAllMenus}
                            title={"Remove Filters Menu"}>
                            {RemoveFilterMenu({modifierState, filterState})}
                        </Drawer>
                    </div>
                )}
            </>
        )
    }

    return (
        <main className="h-screen w-screen">
            <div className="h-full w-full absolute top-0 left-0 z-10">
                <div className="w-full h-10 items-center font-mono text-lg">
                    <MenuBar/>
                </div>
                <div className="flex flex-row h-20">
                    <div className="flex flex-col w-1/3" key={'filter_action_type_header'}>
                        <h1 className="text-4xl font-bold text-tvorange pt-10">Add Filters:</h1>
                    </div>
                    <div className="flex flex-col w-1/3" key={'filter_date_range'}>
                        <h1 className="text-4xl font-bold text-tvorange pt-10">Add Time Range:</h1>
                    </div>
                </div>
                <div className="flex flex-row h-60 overflow-auto">

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
            </div>
            {isAnyMenuOpen ? menuViewer() : <div/>}
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