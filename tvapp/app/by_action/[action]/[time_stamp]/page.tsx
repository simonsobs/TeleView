import {getCursorPerFilter} from "@/utils/mongo/query";
import {mapBy} from "@/utils/mongo/format";
import ufmLink from "@/components/MenuLinks/ufm_numbers";
import React from "react";
import * as mongoDB from "mongodb";

export default async function Page({ params }: { params: { action: string, time_stamp: string} }) {
    const actionType = params.action;
    const time_stamp = parseInt(params.time_stamp);
    const cursor: mongoDB.FindCursor = await getCursorPerFilter(actionType, time_stamp, undefined, undefined, undefined)
    const byUFM: Map<number, Array<object>> = await mapBy(cursor, "ufm_number")
    console.log("By Action, then by time_stamp number:", actionType, time_stamp, "Navigation Page")
    const ufm_numbers: Array<number> = Array.from(byUFM.keys())
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Navigation Page for Action Type: {actionType} and time_stamp {time_stamp}
                </p>
            </div>
            <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                {ufm_numbers.map((ufm_number: number) => ufmLink(ufm_number, byUFM.get(ufm_number)))}
            </div>
        </main>
    )
}