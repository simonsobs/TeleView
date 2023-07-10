import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

import {TELEVIEW_VERBOSE} from "@/utils/config";


interface AppContextInterface {
    isRemoveFilterMenuOpen: boolean;
    setIsRemoveFilterMenuOpen: Dispatch<SetStateAction<boolean>>;
    isMatchMenuOpen: boolean;
    setIsMatchMenuOpen: Dispatch<SetStateAction<boolean>>;
    isTimeRangeMenuOpen: boolean;
    setIsTimeRangeMenuOpen: Dispatch<SetStateAction<boolean>>;
    isAnyMenuOpen: boolean;
    closeAllMenus: () => void;
}


export const queryContextDefaultValue: AppContextInterface = {
    isRemoveFilterMenuOpen: false,
    setIsRemoveFilterMenuOpen: () => false,
    isMatchMenuOpen: false,
    setIsMatchMenuOpen: () => false,
    isTimeRangeMenuOpen: false,
    setIsTimeRangeMenuOpen: () => false,
    isAnyMenuOpen: false,
    closeAllMenus: () => {}
}


export const QueryContext = createContext<AppContextInterface>(queryContextDefaultValue);


export default function QueryProvider({ children }: { children: ReactNode }) {
    // changes in these states will trigger a re-render of components that use them
    const [isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen] = useState<boolean>(false);
    const [isMatchMenuOpen, setIsMatchMenuOpen] = useState<boolean>(false);
    const [isTimeRangeMenuOpen, setIsTimeRangeMenuOpen] = useState<boolean>(false);
    // summary variables for the above states
    const isAnyMenuOpen = isRemoveFilterMenuOpen || isMatchMenuOpen || isTimeRangeMenuOpen;


    const closeAllMenus = () => {
        if (TELEVIEW_VERBOSE) {
            console.log("Closing all menus");
        }
        setIsRemoveFilterMenuOpen(false);
        setIsMatchMenuOpen(false);
        setIsTimeRangeMenuOpen(false);
    }


    return (
        <QueryContext.Provider value={{
            isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen,
            isMatchMenuOpen, setIsMatchMenuOpen,
            isTimeRangeMenuOpen, setIsTimeRangeMenuOpen,
            isAnyMenuOpen, closeAllMenus
        }}>
            {children}
        </QueryContext.Provider>);
};
