import React, {useContext} from "react";

import {QueryContext} from "@/states/query";
import SelectTimeRange from "@/utils/time/select";
import Drawer, {ClickBarrier} from "@/components/menu/drawer";
import RemoveFilterMenu from "@/components/MenuLinks/remove_filter";
import MatchFilterMenu from "@/components/MenuLinks/match_filter";



export default function  MenuViewer (): React.ReactElement {
    const {
        modifierState,
        filterState,
        availableActionTypes,
        availableStreamIDs,
        availablePlatforms,
        timestampDatabaseMin,
        timestampDatabaseMax,
        selectedTimestampMin,
        setSelectedTimestampMin,
        selectedTimestampMax,
        setSelectedTimestampMax,
        isAnyMenuOpen,
        isRemoveFilterMenuOpen,
        isMatchMenuOpen,
        isTimeRangeMenuOpen,
        closeAllMenus
    } = useContext(QueryContext);

    if (isAnyMenuOpen) {
        if (isRemoveFilterMenuOpen) {
            return (
                <>
                    <ClickBarrier onClick={closeAllMenus}/>
                    <div className="h-full w-auto absolute top-0 left-0 z-40 overflow-y-auto">
                        <Drawer
                            closeCallback={closeAllMenus}
                            title={"Remove Filters Menu"}>
                            {RemoveFilterMenu({modifierState, filterState})}
                        </Drawer>
                    </div>
                </>
            )
        } else if (isMatchMenuOpen) {
            return (
                <>
                    <ClickBarrier onClick={closeAllMenus}/>
                    <div className="h-full w-auto absolute top-0 left-0 z-40 overflow-y-auto">
                        <Drawer
                            closeCallback={closeAllMenus}
                            title={"Match Filters Menu"}>
                            {MatchFilterMenu({availableActionTypes, availableStreamIDs, availablePlatforms, modifierState, filterState})}
                        </Drawer>
                    </div>
                </>
            )
        } else if (isTimeRangeMenuOpen) {
            return (
                <>
                    <ClickBarrier onClick={closeAllMenus}/>
                    <div className="h-full w-auto absolute top-0 left-0 z-40  overflow-y-auto">
                        <Drawer
                            closeCallback={closeAllMenus}
                            title={"Time Range Menu"}>
                            {SelectTimeRange({
                                modifierState,
                                filterState,
                                timestampDatabaseMin,
                                timestampDatabaseMax,
                                selectedTimestampMin,
                                setSelectedTimestampMin,
                                selectedTimestampMax,
                                setSelectedTimestampMax
                            })}
                        </Drawer>
                    </div>
                </>
            )
        }
    }
    // If no menu is open, return nothing
    return <></>
}