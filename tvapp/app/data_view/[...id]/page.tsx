import React from "react";
import * as mongoDB from "mongodb";
import {getCursorPerFilter} from "@/utils/mongo/query";
import dataFileLink from "@/components/MenuLinks/data_files";
import {filesBaseURI} from "@/utils/config_http_requests";
import {fetchImage} from "@/components/image/get_image";



// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0

export default async function Page({ params }: { params: { id: Array<string> } }) {
    let [ufm_id, time_stamp_sting, action_type] = params.id;
    ufm_id = ufm_id.toLowerCase()
    let [ufm_letter, ufm_number_sting] = ufm_id.split('v', 2)
    const ufm_number = parseInt(ufm_number_sting)
    const time_stamp = parseInt(time_stamp_sting)
    console.log("data View:", 'ufm_letter:', ufm_letter, ', ufm_number:', ufm_number, ', time_stamp:', time_stamp, ', action_type:', action_type)
    const cursor: mongoDB.FindCursor = await getCursorPerFilter(action_type, time_stamp, undefined, ufm_letter, ufm_number)
    const documents: Array<object> = await cursor.toArray();
    if (documents.length === 0) {
        throw new Error("No data was was found for this query")
    } else if (documents.length > 1) {
        throw new Error("More than one data point was found for this query")
    }
    const document: object = documents[0]
    // @ts-ignore
    const baseURI: string = filesBaseURI + document['path']
    // @ts-ignore
    const dataFiles: Array<string> = document['outputs']
    // @ts-ignore
    const plotFiles: Array<string> = document['plots']
    let dataURIs: Array<string> = []
    if (dataFiles !== undefined) {
        dataURIs = dataFiles.map((file: string) => baseURI + 'outputs/' + file)
    }
    let plotURIs: Array<string> = []
    if (plotFiles) {
        plotURIs = plotFiles.map((file: string) => baseURI + 'plots/' + file)
    }
    console.log(document)
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Data View for UFM {ufm_letter.toUpperCase()}v{ufm_number}, Time Stamp {time_stamp}, Action {action_type}
                </p>
            </div>
            {plotURIs.map(plotURI => fetchImage(plotURI))}
            {dataURIs.map(dataURI => dataFileLink(dataURI))}

        </main>
    )
}