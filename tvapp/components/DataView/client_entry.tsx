import Link from "next/link";
import React, {useContext} from "react";


import {QueryContext} from "@/states/query";
import SmurfDocView, {
    docToUniqueID,
    uniqueIDToLink,
    uniqueIDtoPrintString
} from "@/components/DataView/smurf";


const tailwindArrowBase = "z-30 align-top text-tvgreen text-4xl bg-black bg-opacity-20 rounded-full hover:text-tvyellow hover:bg-black"
export default function NavSmurfDocView(): React.ReactElement {
    const {
        selectedSmurfDocIndex,
        nextSmurfDoc,
        prevSmurfDoc,
        docArray,
    } = useContext(QueryContext)

    if (selectedSmurfDocIndex !== null) {
        const selectedDoc = docArray[selectedSmurfDocIndex]
        const uniqueDocID = docToUniqueID(selectedDoc)
        const linkString = uniqueIDToLink(uniqueDocID)
        const displayString = uniqueIDtoPrintString(uniqueDocID)
        return (
            <div className="relative flex flex-col h-full w-full border-4 border-tvgrey bg-tvorange">
                <div className="h-min z-20 w-full">
                    <Link
                        className="flex flex-1 text-center hover:bg-tvgreen hover:text-tvpurple border-2 border-tvgreen hover:border-tvpurple"
                        key={'NavSmurfDocView_' + displayString}
                        href={linkString}
                        prefetch={false}
                    >
                        Freestanding Link to Smurf Data View
                    </Link>
                </div>
                <div className=" flex flex-1 overflow-auto">
                    <SmurfDocView
                        doc={selectedDoc}
                    />
                    <button
                        className={"absolute top-1/2 right-5 " + tailwindArrowBase}
                        onClick={nextSmurfDoc}
                    >
                        {"->"}
                    </button>
                    <button
                        className={"absolute top-1/2 left-5 " + tailwindArrowBase}
                        onClick={prevSmurfDoc}
                    >
                        {"<-"}
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="h-full w-full border-4 border-tvgrey bg-tvyellow">
            Null SmurfDocView
            <SmurfDocView
                doc={{}}
            />
        </div>
    )
}