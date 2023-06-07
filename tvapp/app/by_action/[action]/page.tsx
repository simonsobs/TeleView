import { listTimesPerAction, mongoOpen, mongoClose } from "@/utils/mongo";
import timestampLink from "@/components/MenuLinks/timestamps";
import React from "react";

export async function getServerSideProps({params}: { params: any}): Promise<{}> {
    console.log("getServerSideProps, params:", params)
    const { action } = params;
    return {
        props: {
            action
        }
    }
}

export default async function Page({ params }: { params: { action: string } }) {
    const actionType: string = params.action;
    console.log("By Action:", actionType, "Navigation Page")
    let timestamps: Array<number> = []
    if (actionType) {
        await mongoOpen()
        timestamps = await listTimesPerAction(actionType)
        await mongoClose()
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Navigation Page for Action Type: {actionType}
                </p>
            </div>

            <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
                {timestamps.map((timestamp: number) => timestampLink(timestamp))}
            </div>
        </main>
    )
}