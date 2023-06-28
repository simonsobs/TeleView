import React from "react";
import Link from "next/link";


export default function dataFileLink(dataFileURI: string): React.ReactNode {
    return (
        <Link href={dataFileURI}
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              key={dataFileURI}
              prefetch={false}
        >
            <h2 className={`mb-3 text-2xl font-semibold`}>
                {dataFileURI}
            </h2>
        </Link>
    )
}