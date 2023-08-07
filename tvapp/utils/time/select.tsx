
import Link from "next/link";
import React from "react";


import {minIsoDate, maxIsoDate} from "@/utils/config";
import {FilterState} from "@/utils/mongo/request_data";
import {filterUpdateURI, ModifierState} from "@/utils/url/filter";
import {timestampToIsoString, isoStringToTimestamp} from "@/utils/time/time";


type SelectTimeInput = {
    headerString: string,
    timeValue: number,
    defaultValue: number,
    setTimeValue: React.Dispatch<React.SetStateAction<number>>
}


function TimeSelect({headerString, timeValue, defaultValue, setTimeValue}: SelectTimeInput) : React.ReactElement {
    const isoTimeString = timestampToIsoString(timeValue)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value === "") {
            setTimeValue(defaultValue)
        } else {
            setTimeValue(isoStringToTimestamp(value))
        }

    }
    return (
        <div className="flex flex-col">
            <div className="text-xl">
                {headerString}
            </div>
            <input
                className={"text-tvorange bg-tvpurple border border-tvyellow"}
                type="number"
                value={timeValue}
                name={headerString + " input timestamp for filter selection"}
                onChange={(event) => setTimeValue(parseInt(event.target.value))}
                key={headerString + " input timestamp for filter selection"}

            />
            <div className="flex flex-row">
                <input className={"text-tvorange bg-tvpurple border border-tvyellow"}
                        type="datetime-local"
                        value={isoTimeString}
                        name={headerString +" input timestamp for filter selection"}
                        onChange={onChange}
                        key={headerString +" input datetime for filter selection"}
                        min={minIsoDate}
                        max={maxIsoDate}
                />
            </div>
        </div>
    )
}


export type SelectTimeRangeInput = {
    modifierState: ModifierState,
    filterState: FilterState,
    timestampDatabaseMin: number,
    timestampDatabaseMax: number,
    selectedTimestampMin: number,
    setSelectedTimestampMin: React.Dispatch<React.SetStateAction<number>>,
    selectedTimestampMax: number,
    setSelectedTimestampMax: React.Dispatch<React.SetStateAction<number>>
}


export default function SelectTimeRange({
        modifierState,
        filterState,
        timestampDatabaseMin,
        timestampDatabaseMax,
        selectedTimestampMin,
        setSelectedTimestampMin,
        selectedTimestampMax,
        setSelectedTimestampMax
    }: SelectTimeRangeInput): React.ReactElement {


    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <TimeSelect
                    headerString={"Min"}
                    timeValue={selectedTimestampMin}
                    defaultValue={timestampDatabaseMin}
                    setTimeValue={setSelectedTimestampMin}
                />
                <TimeSelect
                    headerString={"Max"}
                    timeValue={selectedTimestampMax}
                    defaultValue={timestampDatabaseMax}
                    setTimeValue={setSelectedTimestampMax}
                />
            </div>

            <Link
                href={filterUpdateURI(modifierState, filterState, 'timestamp_range', [selectedTimestampMin, selectedTimestampMax], true)}
                className="m-12"
            >
                <button className="text-tvputple bg-tvbrown border-2 border-tvblue p-4 hover:bg-gogreen hover:text-black hover:border-tvbrown">
                    Submit
                </button>
            </Link>
        </div>

    )
}