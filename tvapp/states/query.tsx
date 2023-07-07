import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";


interface AppContextInterface {
    isRemoveFilterMenuOpen: boolean;
    setIsRemoveFilterMenuOpen: Dispatch<SetStateAction<boolean>>;
    isMatchMenuOpen: boolean;
    setIsMatchMenuOpen: Dispatch<SetStateAction<boolean>>;
    isTimeRangeMenuOpen: boolean;
    setIsTimeRangeMenuOpen: Dispatch<SetStateAction<boolean>>;
}


export const queryContextDefaultValue: AppContextInterface = {
    isRemoveFilterMenuOpen: false,
    setIsRemoveFilterMenuOpen: () => false,
    isMatchMenuOpen: false,
    setIsMatchMenuOpen: () => false,
    isTimeRangeMenuOpen: false,
    setIsTimeRangeMenuOpen: () => false,
}

export const QueryContext = createContext<AppContextInterface>(queryContextDefaultValue);

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen] = useState<boolean>(false);
    const [isMatchMenuOpen, setIsMatchMenuOpen] = useState<boolean>(false);
    const [isTimeRangeMenuOpen, setIsTimeRangeMenuOpen] = useState<boolean>(false);
    return (
        <QueryContext.Provider value={{
            isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen,
            isMatchMenuOpen, setIsMatchMenuOpen,
            isTimeRangeMenuOpen, setIsTimeRangeMenuOpen
        }}>
            {children}
        </QueryContext.Provider>);
};
