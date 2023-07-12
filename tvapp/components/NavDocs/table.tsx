import Link from "next/link";
import React, {useContext} from "react";

import {QueryContext} from "@/states/query";
import {FilterState} from "@/utils/mongo/request_data";
import {ModifierState, genFilterURL, getCurrentIndexRange} from "@/utils/url/filter";


const documentNavCellCSS = "px-4 border border-tvorange text-center"


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
            {indexElement(modifierState, filterState, viewIndexMin, viewIndexMax, true, "current")}
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
                    <div className="table-header-group">
                        <div className="table-row">
                            <div className="table-cell px-4 py-2">Timestamp</div>
                            <div className="table-cell px-4 py-2">Action Type</div>
                            <div className="table-cell px-4 py-2">UFM Label</div>
                            <div className="table-cell px-4 py-2">Timestamp Course</div>
                        </div>
                    </div>
                    <div className="table-row-group">
                        {docArray.map((doc) => {
                            // this can be removed when 'None' type actions can be removed from the database
                            let timestamp = doc['timestamp']
                            if (typeof timestamp === "string" || timestamp === null || timestamp === undefined) {
                                timestamp = 0
                            }
                            const actionType = doc['action_type']
                            const ufmLabel = doc['ufm_label']
                            const timestampCoarse = doc['timestamp_coarse']
                            const linkString: string = 'data_view/' + ufmLabel + '/' + timestamp.toString() + '/' + actionType
                            return (
                                <Link
                                    className="table-row hover:bg-tvpurple hover:text-tvblue"
                                    key={timestamp.toString() + actionType + ufmLabel + timestampCoarse.toString()}
                                    href={linkString}
                                    prefetch={false}
                                >
                                    <div className="table-cell border px-4 py-2">
                                        {timestamp}
                                    </div>
                                    <div className="table-cell border px-4 py-2">
                                        {actionType}
                                    </div>
                                    <div className="table-cell border px-4 py-2">
                                        {ufmLabel}
                                    </div>
                                    <div className="table-cell border px-4 py-2">
                                        {timestampCoarse}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}