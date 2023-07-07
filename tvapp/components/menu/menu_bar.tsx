'use client'

import React, { useContext } from "react";

import QueryProvider, { QueryContext } from "@/states/query";
import { RemoveFilterMenu } from "@/components/menu/remove_filters";
import { ModifierState } from "@/utils/url/filter";
import { GetCursorPerFilterInput } from "@/utils/mongo/query";
import Drawer from "@/components/menu/drawer";



type MenuButtonInput = {
    isClicked: boolean,
    buttonHandler: React.MouseEventHandler<HTMLButtonElement>,
    buttonText: string
}

export function menuButton({isClicked, buttonHandler, buttonText}: MenuButtonInput): React.ReactNode{
    if (isClicked) {
        return (
            <button
                className="bg-tvyellow hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={buttonHandler}
            >
                {buttonText}
            </button>
        )
    }
    return (
        <button
            className="bg-tvpurple hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={buttonHandler}
        >
            {buttonText}
        </button>
    )
}


export default function MenuBar({modifierState, filterState} : {modifierState: ModifierState, filterState: GetCursorPerFilterInput}): React.ReactElement {
    const { isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen} = useContext(QueryContext)
    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        console.log("Clicked, isToggleMenuOpen: " + isRemoveFilterMenuOpen + " -> " + !isRemoveFilterMenuOpen + "")
        setIsRemoveFilterMenuOpen(!isRemoveFilterMenuOpen)
    }
    return (
        <div>
            <div className="grid grid-cols-4 gap-4">
                <div>
                    Placeholder
                </div>
                <div>
                    {menuButton({isClicked: isRemoveFilterMenuOpen, buttonHandler: onClick, buttonText: "Remove Filters"})}
                </div>
            </div>
            <Drawer
                isOpen={isRemoveFilterMenuOpen}
                setIsOpen={setIsRemoveFilterMenuOpen}
                title={"Remove Filters Menu"}>
                {RemoveFilterMenu({modifierState, filterState})}
            </Drawer>
        </div>
    )
}
