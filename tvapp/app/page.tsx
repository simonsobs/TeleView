import getDataMap, {mongoOpen, mongoClose } from "@/utils/mongo";
import actionLink from "@/components/MenuLinks/actions";

export default async function Home() {
  await mongoOpen()
  const valuesMap = await getDataMap()
  await mongoClose()
  const actionTypes = valuesMap.get("actionTypes")
  const courseTimeStamps = valuesMap.get("courseTimeStamps")
  // console.log("All Action Types:\n", actionTypes)
  // console.log("All Course Time Stamps:\n", courseTimeStamps)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-200 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to the TeleView Application!
        </p>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        {actionTypes.map((actionType: string) => actionLink(actionType))}
      </div>
    </main>
  )
}
