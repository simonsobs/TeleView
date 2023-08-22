import Link from "next/link";
import React, {useContext, useEffect} from "react";

import {QueryContext} from "@/states/query";
import {publicBaseURI} from "@/utils/config";
import SimplePopUp from "@/components/menu/pop_up";
import SmurfDocView, {docToUniqueID, uniqueIDToLink, uniqueIDtoPrintString} from "@/components/DataView/smurf";


const tailwindArrowBase = "z-30 pb-3 align-top text-tvgreen text-8xl bg-black bg-opacity-20 rounded-full hover:text-tvyellow hover:bg-black"
export default function NavSmurfDocView(): React.ReactElement {
    const {
        selectedSmurfDocIndex,
        nextSmurfDoc,
        prevSmurfDoc,
        docArray,
        linkCopied,
        setLinkCopied,
    } = useContext(QueryContext)


    useEffect(() => {
        if (linkCopied) {
            setTimeout(() => {
                setLinkCopied(false)
            }, 3000)
        }
    }, [linkCopied])

    if (selectedSmurfDocIndex === null) {
        return (
            <div className="h-full w-full border-4 border-tvgrey bg-tvyellow">
                Null SmurfDocView
                <SmurfDocView
                    doc={{}}
                />
            </div>
        )
    }
    const selectedDoc = docArray[selectedSmurfDocIndex]
    const uniqueDocID = docToUniqueID(selectedDoc)
    const linkString = uniqueIDToLink(uniqueDocID)
    const displayString = uniqueIDtoPrintString(uniqueDocID)
    const LinkCopiedNotification= () => {
        return (
            <div className="absolute top-2 right-0 bg-tvblue text-tvpurple bg-opacity-90 border-2 border-black">
                <SimplePopUp
                    text={"The link to the currently displayed Smurf Data View has been copied to your clipboard."}
                    title={"Link copied"}
                    onClose={() => setLinkCopied(false)}
                />
            </div>
        )
    }
    const linkOnClick = () => {
        setLinkCopied(true)
        navigator.clipboard.writeText(publicBaseURI + linkString.slice(1))
    }
    return (
        <div className="relative flex flex-col h-full w-full border-4 border-tvgrey bg-tvorange">
            <div className="h-min flex flex-row z-20 w-full">
                <Link
                    className="grow text-center hover:bg-tvgreen hover:text-tvpurple border-2 border-tvgreen hover:border-tvpurple"
                    key={'NavSmurfDocView_' + displayString}
                    href={linkString}
                    prefetch={false}
                >
                    Link to the currently displayed Smurf Data View—This freestanding URL is for link sharing
                </Link>
                <button
                    className="text-black bg-tvyellow hover:bg-tvbrown hover:text-tvblue px-2 border-2 border-black"
                    onClick={linkOnClick}
                >
                    Copy Link
                </button>
                {linkCopied ? <LinkCopiedNotification/> : <div/>}

            </div>
            <div className=" flex flex-1 overflow-auto">
                <SmurfDocView
                    doc={selectedDoc}
                />
                <button
                    className={"absolute top-1/2 right-5 " + tailwindArrowBase}
                    onClick={nextSmurfDoc}
                >
                    &#8250;
                </button>
                <button
                    className={"absolute top-1/2 left-5 " + tailwindArrowBase}
                    onClick={prevSmurfDoc}
                >
                    &#8249;
                </button>
            </div>
        </div>
    )
}