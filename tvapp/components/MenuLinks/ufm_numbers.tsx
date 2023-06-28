import React from "react";
import Link from "next/link";
import * as mongoDB from "mongodb";


function getLink(ufm_letter: string, ufm_number: number, timestamp: number | null, action_type: string | null) : React.ReactNode {
    const ufmNumber: string = ufm_number.toString()
    const ufmUpper: string = ufm_letter.toUpperCase()
    let timeStamp: string
    let actionType: string
    if (timestamp === null) {
        timeStamp = 'None'
    }  else {
        timeStamp = timestamp.toString()
    }
    if (action_type === null) {
        actionType = 'None'
    } else {
        actionType = action_type
    }
    const displayString: string = ufmUpper + 'v' + ufmNumber + ' ' + timeStamp + ' ' + actionType
    const linkString: string = 'data_view/' + ufmUpper + 'v' + ufmNumber + '/' + timeStamp + '/' + actionType
    return (
        <Link
            href={linkString}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            key={ufmNumber + '_' + timeStamp + '_' + actionType}
            prefetch={false}
        >
            <h2 className={`mb-3 text-2xl font-semibold`}>
                {displayString}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
            </h2>
        </Link>
    )
}

export default function ufmLink(ufm_number: number, docs: Array<mongoDB.Document> | undefined): React.ReactNode {
    let displayString: string
    console.log("ufmLink", ufm_number, docs)
    if (docs) {
        if (docs.length > 1) {
            docs.map((doc: mongoDB.Document) => {
                return getLink(doc['ufm_letter'], doc['ufm_number'], doc['timestamp'], doc['action_type'])
            })
        }
        const doc = docs[0]
        return getLink(doc['ufm_letter'], doc['ufm_number'], doc['timestamp'], doc['action_type'])
    } else {
        displayString = ufm_number.toString()
        return (
            <a
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                rel="noopener noreferrer"
                key={ufm_number.toString()}
            >
                <h2 className={`mb-3 text-2xl font-semibold`}>
                    {displayString}
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>

                </h2>
            </a>
        )
    }

}