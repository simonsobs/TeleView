import React from "react";
import * as mongoDB from "mongodb";

import {fetchImage} from "@/components/image/get_image";
import dataFileLink from "@/components/MenuLinks/data_files";
import {TELEVIEW_VERBOSE, filesBaseURI} from "@/utils/config";
import {getCursorPerFilter, FilterState} from "@/utils/mongo/request_data";
import SmurfDocView, {extractURLFromDoc, uniqueIDtoPrintString, urlArrayToUniqueID} from "@/components/DataView/smurf";


// set this to zero, query the database, getting the newest data, and remake the page
export const revalidate = 0

export default async function Page({ params }: { params: { id: Array<string> } }) {
    const smurfDocID = urlArrayToUniqueID(params.id)
    const filterState: FilterState = {
        action_type: new Set([smurfDocID.action_type]),
        timestamp: new Set([smurfDocID.timestamp]),
        ufm_letter: undefined,
        ufm_number: undefined,
        stream_id: new Set([smurfDocID.stream_id]),
        platform: new Set([smurfDocID.platform]),
        timestamp_range: undefined,
        timestamp_coarse: new Set([smurfDocID.timestamp_coarse]),
    }

    const cursor: mongoDB.FindCursor = await getCursorPerFilter(filterState)
    const documents: Array<object> = await cursor.toArray();
    if (documents.length === 0) {
        throw new Error("No data was was found for this query")
    } else if (documents.length > 1) {
        // this should not be possible do the unique constraint for the compound index in MongoDB for these parameters
        throw new Error("More than one data point was found for this query")
    }
    const doc: object = documents[0]
    const displayString = uniqueIDtoPrintString(smurfDocID)
    if (TELEVIEW_VERBOSE) {
        console.log("data View:", displayString)
        console.log(doc)
    }
    const [plotURLs, dataURLs] = extractURLFromDoc(doc)
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Data View for {displayString}
                </p>
            </div>
            <SmurfDocView
                plotURLs={plotURLs}
                dataURLs={dataURLs}
            />
            {/*{plotURIs.map(plotURI => fetchImage(plotURI))}*/}
            {/*{dataURIs.map(dataURI => dataFileLink(dataURI))}*/}
        </main>
    )
}
