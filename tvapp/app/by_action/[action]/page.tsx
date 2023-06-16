import React from "react";
import timestampLink from "@/components/MenuLinks/timestamps";
import { listTimesPerAction } from "@/utils/mongo/query";
import * as mongoDB from "mongodb";


// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0


export default async function Page({ params }: { params: { action: string } }) {
    const actionType = params.action;
    const uriPrefix: string = "by_action" + "/" + actionType
    console.log("By Action:", actionType, "Navigation Page")
    const time_stamps: Array<number> = await listTimesPerAction(actionType)
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Navigation Page for Action Type: {actionType}
                </p>
            </div>

            <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                {time_stamps.map((timestamp: number) => timestampLink(timestamp, uriPrefix))}
            </div>
        </main>
    )
}