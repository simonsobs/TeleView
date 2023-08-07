import React from "react";
import * as mongoDB from "mongodb";
import {getCursorPerFilter, FilterState} from "@/utils/mongo/request_data";
import dataFileLink from "@/components/MenuLinks/data_files";
import {TELEVIEW_VERBOSE, filesBaseURI} from "@/utils/config";
import {fetchImage} from "@/components/image/get_image";



// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0

export default async function Page({ params }: { params: { id: Array<string> } }) {
    let [platform, streamId, timestamp_sting, action_type] = params.id;
    const timestamp = parseInt(timestamp_sting)
    const filterState: FilterState = {
        action_type: new Set([action_type]),
        timestamp: new Set([timestamp]),
        ufm_letter: undefined,
        ufm_number: undefined,
        stream_id: new Set([streamId]),
        platform: new Set([platform]),
        timestamp_range: undefined,
        timestamp_coarse: undefined,
    }

    const cursor: mongoDB.FindCursor = await getCursorPerFilter(filterState)
    const documents: Array<object> = await cursor.toArray();
    if (documents.length === 0) {
        throw new Error("No data was was found for this query")
    } else if (documents.length > 1) {
        throw new Error("More than one data point was found for this query")
    }
    const document: object = documents[0]
    if (TELEVIEW_VERBOSE) {
        console.log("data View:", 'platform:', platform, 'streamID:', streamId,  ', timestamp:', timestamp, ', action_type:', action_type)
        console.log(document)
    }
    // @ts-ignore
    const baseURI: string = filesBaseURI + document['platform'] + '/' + document['path']
    // @ts-ignore
    const dataFiles: Array<string> = document['outputs']
    // @ts-ignore
    const plotFiles: Array<string> = document['plots']
    let dataURIs: Array<string> = []
    if (dataFiles) {
        dataURIs = dataFiles.map((file: string) => baseURI + 'outputs/' + file)
    }
    let plotURIs: Array<string> = []
    if (plotFiles) {
        plotURIs = plotFiles.map((file: string) => baseURI + 'plots/' + file)
    }
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Data View for Platform: {platform}, Stream ID: {streamId}, Timestamp: {timestamp}, Action: {action_type}
                </p>
            </div>
            {plotURIs.map(plotURI => fetchImage(plotURI))}
            {dataURIs.map(dataURI => dataFileLink(dataURI))}
        </main>
    )
}
