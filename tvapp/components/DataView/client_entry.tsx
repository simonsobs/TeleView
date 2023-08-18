import Link from "next/link";
import React, {useContext} from "react";

import {filesBaseURI} from "@/utils/config";
import {QueryContext} from "@/states/query";
import SmurfDocView, {
    docToUniqueID,
    extractURLFromDoc,
    uniqueIDToLink,
    uniqueIDtoPrintString
} from "@/components/DataView/smurf";



export default function NavSmurfDocView(): React.ReactElement {
    const {
        selectedSmurfDocIndex,
        docArray,
    } = useContext(QueryContext)

    if (selectedSmurfDocIndex !== null) {
        const selectedDoc = docArray[selectedSmurfDocIndex]
        const [plotURLs, dataURLs] = extractURLFromDoc(selectedDoc)
        const uniqueDocID = docToUniqueID(selectedDoc)
        const linkString = uniqueIDToLink(uniqueDocID)
        const displayString = uniqueIDtoPrintString(uniqueDocID)
        return (
            <div className="h-full w-full border-4 border-tvgrey bg-tvyellow">
                <Link
                    className="flex flex-1 hover:bg-tvpurple hover:text-tvblue border-2 border-tvorange hover:border-tvpurple"
                    key={'NavSmurfDocView_' + displayString}
                    href={linkString}
                    prefetch={false}
                >
                    Freestanding Link to Smurf Data View
                </Link>
                <SmurfDocView
                    plotURLs={plotURLs}
                    dataURLs={dataURLs}
                />
            </div>
        )
    }
    return (
        <div className="h-full w-full border-4  border-tvgrey bg-tvyellow">
            Null SmurfDocView
            <SmurfDocView
                plotURLs={[]}
                dataURLs={[]}
            />
        </div>
    )
}