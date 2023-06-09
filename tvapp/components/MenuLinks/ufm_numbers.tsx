import React from "react";
import Link from "next/link";
import * as mongoDB from "mongodb";


export default function ufmLink(ufm_number: number, docs: Array<mongoDB.Document> | undefined): React.ReactNode {
    let displayString: string
    let linkString: string = 'data_view/'
    console.log("ufmLink", ufm_number, docs)
    if (docs) {
        if (docs.length > 1) {
            throw new Error("ufmLink: docs.length > 1, this is expected to be unique")
        }
        const doc = docs[0]
        displayString = doc['ufm_letter'].toUpperCase() + 'v' + doc['ufm_number'] + ' ' + doc['time_stamp'] + ' ' + doc['action_type']
        linkString += doc['ufm_letter'].toUpperCase() + 'v' + doc['ufm_number'] + '/' + doc['time_stamp'] + '/' + doc['action_type']
        return (
            <Link
                href={linkString}
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
            </Link>
        )
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