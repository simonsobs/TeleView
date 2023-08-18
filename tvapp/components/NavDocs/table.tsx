import Link from "next/link";
import React, {useContext} from "react";

import {QueryContext} from "@/states/query";
import {TELEVIEW_VERBOSE} from "@/utils/config";
import {timestampToIsoString} from "@/utils/time/time";
import {FilterState} from "@/utils/mongo/request_data";
import {ModifierState, genFilterURL, getCurrentIndexRange} from "@/utils/url/filter";
import {docToUniqueID, uniqueIDToLink, uniqueIDtoPrintString} from "@/components/DataView/smurf";


const documentNavCellCSS = "px-4 border border-tvorange text-center overflow-hidden"

type AllowedNavHandle = 'platform' | 'action_type' | 'data_time' | 'timestamp' | 'ufm_label' | 'timestamp_coarse' | 'stream_id'


type HandleProp = {
    'platform': string,
    'action_type': string,
    'data_time': string,
    'timestamp': string,
    'ufm_label': string,
    'timestamp_coarse': string,
    'stream_id': string,
}


const navTableHandlesDefault: Array<AllowedNavHandle> = [
    'platform',
    'action_type',
    'data_time',
    'timestamp',
    'ufm_label',
    'stream_id',
]

const handleToTitle: HandleProp = {
    'platform': 'Platform',
    'action_type': 'Action Type',
    'data_time': 'Date Time (UTC)',
    'timestamp': 'Timestamp',
    'ufm_label': 'UFM Label',
    'timestamp_coarse': 'Timestamp Coarse',
    'stream_id': 'Stream ID',
}

function navTableHeader(navTableHandles: Array<AllowedNavHandle>): React.ReactElement {
    const headerCells = navTableHandles.map((handle) => {
        return (
            <div className="table-cell px-4 py-2" key={"NavTableHeaderCell_" +handle}>
                {handleToTitle[handle]}
            </div>
        )
    })
    return (
        <div className="table-header-group">
            <div className="table-row text-center">
                {headerCells}
            </div>
        </div>
    )
}


function navTableCell(doc: { [x: string]: any; }, navHandle: AllowedNavHandle): React.ReactElement {
    let cellString: string
    switch(navHandle) {
        case 'data_time':
            const timestamp = doc['timestamp'];
            const [date, time] = timestampToIsoString(timestamp).split('T');
            cellString = date + " " + time;
            break;
        case 'timestamp':
        case 'timestamp_coarse':
            cellString = doc['timestamp'].toString();
            break;
        default:
            cellString = doc[navHandle];
    }
    return (
        <div className="table-cell border px-1 py-2 text-center" key={doc['_id'] + navHandle}>
            {cellString}
        </div>
    )
}


function navTableRow(doc: { [x: string]: any; }, docIndex: number, navTableHandles: Array<AllowedNavHandle>): React.ReactElement {
    const uniqueDocID = docToUniqueID(doc)
    const linkString = uniqueIDToLink(uniqueDocID)
    const displayString = uniqueIDtoPrintString(uniqueDocID)
    console.log('docIndex', docIndex)
    return (
        <Link
            className="table-row hover:bg-tvpurple hover:text-tvblue"
            key={'navTableRow_' + displayString}
            href={linkString}
            prefetch={false}
        >
            {navTableHandles.map((navHandle) => {
                return navTableCell(doc, navHandle)
            })}
        </Link>
    )
}


function indexElement(
    modifierState: ModifierState,
    filterState: FilterState,
    indexMin: number,
    indexMax: number,
    isCurrent: boolean,
    keyType: string,
): React.ReactElement {
    if (indexMax === indexMin) {
        return (
            <div className={documentNavCellCSS} key={'null_modifier_no_state_change' + indexMin + keyType}>
                {" "}
            </div>
        )
    } else if (isCurrent) {
        return (
            <div className={documentNavCellCSS + " text-tvgrey"} key={'current_modifier_no_state_change' + indexMin + "-" + indexMax}>
                {indexMin + 1} - {indexMax}
            </div>
        )
    } else {
        const modifierStateNew: ModifierState = { ...modifierState }
        modifierStateNew.document_range = [indexMin, indexMax]
        const url = genFilterURL(modifierStateNew, filterState)
        return (
            <Link href={url}
                  key={'modifier_state_change_link' + url}
                  className={documentNavCellCSS + " text-tvblue hover:text-tvpurple hover:bg-tvblue"}
                  prefetch={false}
            >
                {indexMin + 1} - {indexMax}
            </Link>
        )
    }
}


function documentIndexNav(
    modifierState: ModifierState,
    filterState: FilterState,
    documentItemLimit:number,
    viewIndexMin:number,
    viewIndexMax:number,
    maxIndex: number
): React.ReactElement {
    if (TELEVIEW_VERBOSE) {
        console.log("View Index Range: " + viewIndexMin + " - " + viewIndexMax + " of " + maxIndex + " documents")
    }


    const prevIndexMin = Math.max(0, viewIndexMin - documentItemLimit)
    const prevIndexMax = Math.max(viewIndexMin, 0)
    const firstIndexMax = Math.max(Math.min(documentItemLimit, prevIndexMin), 0)

    const nextIndexMin = Math.min(maxIndex, viewIndexMax)
    const nextIndexMax = Math.min(maxIndex, nextIndexMin + documentItemLimit)
    const lastIndexMin = Math.min(Math.max(maxIndex - documentItemLimit, nextIndexMax), maxIndex)

    return (
        <div className="grid grid-cols-5 text-tvyellow bg-tvpurple">
            <div className={documentNavCellCSS}>First</div>
            <div className={documentNavCellCSS}>Prev</div>
            <div className={documentNavCellCSS}>Current</div>
            <div className={documentNavCellCSS}>Next</div>
            <div className={documentNavCellCSS}>Last</div>
            {indexElement(modifierState, filterState, 0, firstIndexMax, false, "first")}
            {indexElement(modifierState, filterState, prevIndexMin, prevIndexMax, false, "prev")}
            {indexElement(modifierState, filterState, viewIndexMin, Math.min(maxIndex, viewIndexMax), true, "current")}
            {indexElement(modifierState, filterState, nextIndexMin, nextIndexMax, false, "next")}
            {indexElement(modifierState, filterState, lastIndexMin, maxIndex, false, "last")}
        </div>
    )
}


export default function NavTable(): React.ReactElement {

    const {
        modifierState,
        filterState,
        docArray,
        documentItemLimit,
        maxIndex,
    } = useContext(QueryContext)

    let [viewIndexMin, viewIndexMax] = getCurrentIndexRange(modifierState, documentItemLimit)

    const tableNavBar = documentIndexNav(
        modifierState,
        filterState,
        documentItemLimit,
        viewIndexMin,
        viewIndexMax,
        maxIndex
    )

    return (
        <div className="flex flex-col h-full w-full border-4 text-tvgry bg-tvgreen">
            <div className=" h-min text-tvgry bg-tvbrown">
                {tableNavBar}
            </div>
            <div className="flex justify-center text-tvgry border-4 bg-tvbrown border-tvgreen overflow-auto">
                <div className="table-auto">
                    {navTableHeader(navTableHandlesDefault)}
                    <div className="table-row-group">
                        {docArray.map((doc, docIndex) => navTableRow(doc, docIndex, navTableHandlesDefault))}
                    </div>
                </div>
            </div>
        </div>
    )
}