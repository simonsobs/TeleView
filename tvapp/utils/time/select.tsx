'use client'

import Link from "next/link";
import React, { useState } from "react";

import {nowTimestamp, timestampToIsoString, isoStringToTimestamp} from "@/utils/time/time";
import {filterUpdateURI, ModifierState} from "@/utils/url/filter";
import {GetCursorPerFilterInput} from "@/utils/mongo/query";


type SelectTimeInput = {
    headerString: string,
    timeValue: number,
    setTimeValue: React.Dispatch<React.SetStateAction<number>>
}


function TimeSelect({headerString, timeValue, setTimeValue}: SelectTimeInput) : React.ReactElement {
    const isoTimeString = timestampToIsoString(timeValue)
    return (
        <div className="flex flex-row">
            <div className="flex flex-col">
                <h1>{headerString}</h1>
                <input
                    className={"text-tvorange bg-tvpurple border border-tvyellow"}
                    type="number"
                    value={timeValue}
                    name={headerString +" input timestamp for filter selection"}
                    onChange={(event) => setTimeValue(parseInt(event.target.value))}
                    key={headerString +" input timestamp for filter selection"}

                />
                <div className="flex flex-row">
                    <input className={"text-tvorange bg-tvpurple border border-tvyellow"}
                            type="datetime-local"
                            value={isoTimeString}
                            name={headerString +" input timestamp for filter selection"}
                            onChange={(event) => setTimeValue(isoStringToTimestamp(event.target.value))}
                            key={headerString +" input datetime for filter selection"}
                            min="1970-01-01T00:00"
                            max="2099-12-19T23:59"
                    />
                </div>
            </div>
        </div>
    )
}


export type SelectTimeRangeInput = {
    suggestedMin: number | undefined,
    suggestedMax: number | undefined,
    modifierState: ModifierState,
    filterState: GetCursorPerFilterInput
}


export default function SelectTimeRange({suggestedMin, suggestedMax, modifierState, filterState } : SelectTimeRangeInput)
    : React.ReactElement {
    const [min, setMin] = useState<number>(suggestedMin ?? 0)
    const [max, setMax] = useState<number>(suggestedMax ?? nowTimestamp())

    console.log("Client side time range selection", min, max)
    return (
        <div className="flex flex-row h-full w-full">
            <div className="text-tvgrey">
                <div className="flex flex-col w-1/2">
                    <TimeSelect
                        headerString={"Min"}
                        timeValue={min}
                        setTimeValue={setMin}
                    />
                    <TimeSelect
                        headerString={"Max"}
                        timeValue={max}
                        setTimeValue={setMax}
                    />
                    <Link href={filterUpdateURI(modifierState, filterState, 'timestamp_range', [min, max], true)}>
                        <button className="text-tvblue bg-tvpurple border border-tvyellow">
                            Submit
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}