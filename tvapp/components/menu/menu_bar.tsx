import Link from "next/link";
import React, {Dispatch, SetStateAction, useContext} from "react";

import { QueryContext } from "@/states/query";
import getAPIBaseURL from "@/utils/url/get_real_url";


type MenuButtonInput = {
    isClicked: boolean,
    setIsClicked: Dispatch<SetStateAction<boolean>>,
    buttonText: string,
    isCloseButton: boolean,
}


export function menuButton({isClicked, setIsClicked, buttonText, isCloseButton}: MenuButtonInput): React.ReactNode{
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        console.log("Clicked, isToggleMenuOpen: " + isClicked + " -> " + !isClicked + "")
        setIsClicked(!isClicked)
    }
    let  buttonStyle: string
    // Tailwind uses regex to find class names, so we can't use variables
    if (isCloseButton) {
        if (isClicked) {
            buttonStyle = "bg-purple hover:bg-stopred text-white hover:text-white font-bold py-2 px-4 rounded"
        } else {
            buttonStyle = "bg-stopred hover:bg-gogreen text-white hover:text-black font-bold py-2 px-4 rounded"
        }

    } else {
        if (isClicked) {
            buttonStyle = "bg-tvyellow hover:bg-tvpurple text-black hover:text-white font-bold py-2 px-4 rounded"
        } else {
            buttonStyle = "bg-tvpurple hover:bg-tvorange text-white hover:text-black font-bold py-2 px-4 rounded"
        }
    }
    return (
        <button className={buttonStyle} onClick={onClick}>
            {buttonText}
        </button>
    )
}


export default function MenuBar(): React.ReactElement {
    const {
        isRemoveFilterMenuOpen,
        setIsRemoveFilterMenuOpen,
        isMatchMenuOpen,
        setIsMatchMenuOpen,
        isTimeRangeMenuOpen,
        setIsTimeRangeMenuOpen,
    } = useContext(QueryContext)

    return (
        <div>
            <div className="flex flex-row gap-4">
                <div>
                    {menuButton({isClicked: isRemoveFilterMenuOpen, setIsClicked: setIsRemoveFilterMenuOpen, buttonText: "Remove Filters", isCloseButton: true})}
                </div>
                <div>
                    {menuButton({isClicked: isMatchMenuOpen, setIsClicked: setIsMatchMenuOpen, buttonText: "Match Filters", isCloseButton: false})}
                </div>
                <div>
                    {menuButton({isClicked: isTimeRangeMenuOpen, setIsClicked: setIsTimeRangeMenuOpen, buttonText: "Time Range Filters", isCloseButton: false})}
                </div>
                <div>
                    <Link href={getAPIBaseURL()}>
                        <button className="bg-tvyellow hover:bg-tvbrown text-black hover:text-white font-bold py-2 px-4 rounded">
                            Temp Link to Database Refresher
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
