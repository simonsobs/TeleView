'use client'

import mongo from "mongodb";
import React, {ReactElement} from "react";

import QueryProvider from "@/states/query";
import MenuBar from "@/components/menu/menu_bar";
import {ModifierState} from "@/utils/url/filter";
import NavTable from "@/components/NavDocs/table";
import MenuViewer from "@/components/menu/menu_view";
import {FilterState} from "@/utils/mongo/request_data";


export function QueryClient(): ReactElement {
    return (
        <main className="h-screen w-screen">
            <div className="flex flex-col h-full w-full absolute top-0 left-0 z-10">
                <div className="flex-none w-full items-center font-mono text-lg p-4">
                    <MenuBar/>
                </div>
                <div className="grow h-14">
                    <div className="h-full w-full px-24">
                        <NavTable/>
                    </div>
                </div>
            </div>
            <MenuViewer/>
        </main>
    )
}


type QueryClientInput = {
    modifierState: ModifierState,
    filterState: FilterState
    documentItemLimit: number
    docArray: Array<mongo.Document>
    availableActionTypes: Array<string>
    availableStreamIDs: Array<string>
    availablePlatforms: Array<string>
    maxIndex: number
    timestampDatabaseMin: number
    timestampDatabaseMax: number
}


// Here is the entry point to the client side components using the data from the server
export default function QueryPage(
    {
        modifierState,
        filterState,
        documentItemLimit,
        docArray,
        availableActionTypes,
        availableStreamIDs,
        availablePlatforms,
        maxIndex,
        timestampDatabaseMin,
        timestampDatabaseMax
    } : QueryClientInput): React.ReactElement {
    return (
        <QueryProvider
            modifierState={modifierState}
            filterState={filterState}
            documentItemLimit={documentItemLimit}
            docArray={docArray}
            availableActionTypes={availableActionTypes}
            availableStreamIDs={availableStreamIDs}
            availablePlatforms={availablePlatforms}
            maxIndex={maxIndex}
            timestampDatabaseMin={timestampDatabaseMin}
            timestampDatabaseMax={timestampDatabaseMax}
        >
            <QueryClient/>
        </QueryProvider>
    )

}