import React from "react";


function getDate(timestamp: number): [string, Number] {
    let timestampAsString: string = timestamp.toString()
    let timestampFull: number
    console.log("timestamp:", timestamp, "timestampAsString.len", timestampAsString.length)
    if (timestampAsString.length === 5) {
        // This is a course (approximately per-day) unix timestamp, so we need to add 5 zeros to the end
        timestampAsString = timestampAsString + '00000'
        timestampFull = parseInt(timestampAsString)

    } else {
        timestampFull = timestamp
    }
    const timeStampMilliSeconds : number = timestampFull * 1000
    const date = new Date(timeStampMilliSeconds)
    console.log("date:", date)
    return [date.toUTCString(), timestampFull]
}


export default function timestampLink(timestamp: number): React.ReactNode {
    const [date, timestampFull] = getDate(timestamp)
    return (
        <a
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            key={timestamp}
        >
            <h2 className={`mb-3 text-2xl font-semibold`}>
                <p>
                    {timestamp.toString()}
                </p>
                <p>
                    {'(' + date + ')' }
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -&gt;
                    </span>
                </p>

            </h2>
        </a>
    )
}
