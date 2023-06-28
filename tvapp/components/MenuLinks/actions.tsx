import React from "react";
import Link from 'next/link';

export default function actionLink(actionType: string, uri: string): React.ReactNode {
    return (
        <Link href={uri + "/" + actionType}
              className="group rounded-lg border border-transparent px-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              key={actionType}
              prefetch={false}
        >
            <h2 className={`mb-3 text-2xl text-tvblue font-semibold`}>
                {actionType + ' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
            </h2>
        </Link>
    )
}