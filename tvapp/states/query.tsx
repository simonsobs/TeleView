import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

import {documentLimitDefault, TELEVIEW_VERBOSE} from "@/utils/config";
import { FilterState } from "@/utils/mongo/request_data";
import {ModifierState} from "@/utils/url/filter";


interface AppContextInterface {
    modifierState: ModifierState,
    filterState:FilterState,
    documentItemLimit: number,
    docArray: Array<any>,
    availableActionTypes: Array<string>,
    maxIndex: number,
    timestampDatabaseMin: number,
    timestampDatabaseMax: number,
    selectedTimestampMin: number,
    setSelectedTimestampMin: Dispatch<SetStateAction<number>>,
    selectedTimestampMax: number,
    setSelectedTimestampMax: Dispatch<SetStateAction<number>>,
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
    modifierState: {},
    filterState: {
        action_type: undefined,
        timestamp: undefined,
        timestamp_coarse: undefined,
        ufm_letter: undefined,
        ufm_number: undefined,
        timestamp_range: undefined
    },
    documentItemLimit: documentLimitDefault,
    docArray: [],
    availableActionTypes: [],
    maxIndex: 0,
    timestampDatabaseMin: 0,
    timestampDatabaseMax: 4102444800,
    selectedTimestampMin: 0,
    setSelectedTimestampMin: () => 0,
    selectedTimestampMax: 4102444800,
    setSelectedTimestampMax: () => 4102444800,
    isRemoveFilterMenuOpen: false,
    setIsRemoveFilterMenuOpen: () => false,
    isMatchMenuOpen: false,
    setIsMatchMenuOpen: () => false,
    isTimeRangeMenuOpen: false,
    setIsTimeRangeMenuOpen: () => false,
    isAnyMenuOpen: false,
    closeAllMenus: () => {},
}


export const QueryContext = createContext<AppContextInterface>(queryContextDefaultValue);


type QueryProviderInput = {
    modifierState: ModifierState
    filterState: FilterState
    documentItemLimit: number
    docArray: Array<any>
    availableActionTypes: Array<string>,
    maxIndex: number
    timestampDatabaseMin: number
    timestampDatabaseMax: number
    children: ReactNode
}
export default function QueryProvider(
    {
        modifierState,
        filterState,
        documentItemLimit=documentLimitDefault,
        docArray = [],
        availableActionTypes = [],
        maxIndex = 0,
        timestampDatabaseMin = 0,
        timestampDatabaseMax = 0,
        children
    } : QueryProviderInput) {
    /* changes in these states will trigger a re-render of components that use them */
    // timestamp range states
    const [selectedTimestampMin, setSelectedTimestampMin] = useState<number>(timestampDatabaseMin);
    const [selectedTimestampMax, setSelectedTimestampMax] = useState<number>(timestampDatabaseMax);
    // menu visibility states
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
            modifierState,
            filterState,
            documentItemLimit,
            docArray,
            availableActionTypes,
            maxIndex,
            timestampDatabaseMin,
            timestampDatabaseMax,
            selectedTimestampMin, setSelectedTimestampMin,
            selectedTimestampMax, setSelectedTimestampMax,
            isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen,
            isMatchMenuOpen, setIsMatchMenuOpen,
            isTimeRangeMenuOpen, setIsTimeRangeMenuOpen,
            isAnyMenuOpen, closeAllMenus,
        }}>
            {children}
        </QueryContext.Provider>);
};
