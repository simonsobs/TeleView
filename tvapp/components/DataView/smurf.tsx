import React from "react";
import {fetchImage} from "@/components/image/get_image";
import dataFileLink from "@/components/MenuLinks/data_files";
import {filesBaseURI} from "@/utils/config";


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
    plotURLs: Array<string>,
    dataURLs: Array<string>,
}

export function extractURLFromDoc(doc: any): [Array<string>, Array<string>] {
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
    let dataURLs: Array<string> = []
    if (dataFiles) {
        dataURLs = dataFiles.map((file: string) => baseURI + 'outputs/' + file)
    }
    return [plotURLs, dataURLs]
}


export default function SmurfDocView({plotURLs, dataURLs}: DocViewProps): React.ReactElement {
    console.log("plotURLs", plotURLs)
    return (
        <div className="flex flex-col h-full w-full text-tvgry bg-tvbrown">
            Document View for Smurf Data
            {plotURLs.map(plotURL => fetchImage(plotURL))}
            {dataURLs.map(dataURL => dataFileLink(dataURL))}
        </div>
    )
}