import getDataMap from "@/utils/mongo/query";
import actionLink from "@/components/MenuLinks/actions";


// set this to 0, query the database, getting the newest data, and remake the page
export const revalidate = 0


export default async function Page() {
    const valuesMap = await getDataMap()
    const actionTypes = valuesMap.get("actionTypes")
    // const courseTimeStamps = valuesMap.get("courseTimeStamps")

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    Welcome to the TeleView Application!
                </p>
            </div>
            <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
              {actionTypes.map((actionType: string) => actionLink(actionType, "by_action"))}
            </div>
        </main>
    )
}
