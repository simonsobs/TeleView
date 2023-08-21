import React from "react";
import * as mongoDB from "mongodb";


import {getCursorPerFilter, FilterState} from "@/utils/mongo/request_data";
import SmurfDocView, {urlArrayToUniqueID} from "@/components/DataView/smurf";


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
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <SmurfDocView
                doc={doc}
            />
        </main>
    )
}
