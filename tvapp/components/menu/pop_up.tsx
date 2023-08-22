import React from 'react';

import {TELEVIEW_VERBOSE} from "@/utils/config";


const closeText = "Click to close"


type SimplePopProps = {
    text: string | React.ReactElement,
    title: string | null,
    onClose: () => void,
}


export default function SimplePopUp ({
                        text= "Popup content here !!",
                        title=null,
                        onClose= () => console.log('Popup closed'),
                      }: SimplePopProps): React.ReactElement {
    if (TELEVIEW_VERBOSE) {
        console.log("SimplePop title: ", title);
    }
    return (
        <div className="text-md ">
            <div className="flex flex-row">
                <div className="grow">
                    {title ? <div className="text-center"> {title} </div> : <> </>}
                </div>
                <button className="flex-none bg-stopred text-tvgrey border-2 border-tvgrey hover:text-black hover:border-black" onClick={onClose}>
                    &times;
                </button>
            </div>

            <div className="content text-sm">
                {text}
            </div>
            <div className="bg-stopred text-center text-tvgrey border-2 border-tvgrey hover:text-black hover:border-black">
                <button
                    className="button"
                    onClick={onClose}
                >
                    {closeText}
                </button>
            </div>
        </div>
    )
}
