import React from "react";
import {fetchImage} from "@/components/image/get_image";
import dataFileLink from "@/components/MenuLinks/data_files";
import {filesBaseURI, TELEVIEW_VERBOSE} from "@/utils/config";


const componentOrder = [
    'platform',
    'timestamp_coarse',
    'stream_id',
    'action_type',
    'timestamp',
]

function uniqueIDtoURLArray(smurfDocID: UniqueSmurfDocID): Array<string> {
    return [
        smurfDocID.platform,
        smurfDocID.timestamp_coarse.toString(),
        smurfDocID.stream_id,
        smurfDocID.timestamp.toString(),
        smurfDocID.action_type,
    ]
}

export type UniqueSmurfDocID = {
    'platform': string,
    'timestamp_coarse': number,
    'stream_id': string,
    'timestamp': number,
    'action_type': string,
}


export function docToUniqueID(doc: any): UniqueSmurfDocID {
    return {
        'platform': doc['platform'],
        'timestamp_coarse': doc['timestamp_coarse'],
        'stream_id': doc['stream_id'],
        'timestamp': doc['timestamp'],
        'action_type': doc['action_type'],
    }
}


export function uniqueIDToLink(smurfDocID: UniqueSmurfDocID): string {
    const idArray = uniqueIDtoURLArray(smurfDocID)
    return '/smurf_data_view/' + idArray.join('/')
}

export function urlArrayToUniqueID(urlArray: Array<string>): UniqueSmurfDocID {
    const [platform, timestamp_coarse_string, stream_id, timestamp_sting, action_type] = urlArray;
    const timestamp = parseInt(timestamp_sting)
    const timestamp_coarse = parseInt(timestamp_coarse_string)
    return {
        'platform': platform,
        'timestamp_coarse': timestamp_coarse,
        'stream_id': stream_id,
        'timestamp': timestamp,
        'action_type': action_type,
    }
}


export function uniqueIDtoPrintString(smurfDocID: UniqueSmurfDocID): string {
    const valueArray = uniqueIDtoURLArray(smurfDocID)
    let printString = ""
    for (let i = 0; i < componentOrder.length; i++) {
        printString += componentOrder[i] + ": " + valueArray[i] + ", "
    }
    return printString.slice(0, -2)
}


export type DocViewProps = {
    doc: any,
}

function extractURLFromDoc(doc: any): [Array<string>, Array<[string, string]>] {
    // @ts-ignore
    const baseURI: string = filesBaseURI + doc['platform'] + '/' + doc['path']
    // @ts-ignore
    const dataFiles: Array<string> = doc['outputs']
    // @ts-ignore
    const plotFiles: Array<string> = doc['plots']
    let plotURLs: Array<string> = []
    if (plotFiles) {
        plotURLs = plotFiles.map((file: string) => baseURI + 'plots/' + file)
    }
    let dataURLsAndDisplays: Array<[string, string]> = []
    if (dataFiles) {
        dataURLsAndDisplays = dataFiles.map((file: string) => [baseURI + 'outputs/' + file, file])
    }
    return [plotURLs, dataURLsAndDisplays]
}


export default function SmurfDocView({doc}: DocViewProps): React.ReactElement {
    const [plotURLs, dataURLsAndDisplays] = extractURLFromDoc(doc)
    const uniqueDocID = docToUniqueID(doc)
    const displayString = uniqueIDtoPrintString(uniqueDocID)
    if (TELEVIEW_VERBOSE) {
        console.log("data View:", displayString)
        console.log(doc)
    }

    return (
        <div className="flex flex-col h-full w-full text-tvgry bg-tvbrown">
                <div className="flex w-full p-2 border-b border-gray-200">
                    SMURF Data View—{displayString}
                </div>

            {plotURLs.map(plotURL => fetchImage(plotURL))}
            {dataURLsAndDisplays.map(dataURLAndDisplay => dataFileLink(dataURLAndDisplay[0], dataURLAndDisplay[1]))}
        </div>
    )
}