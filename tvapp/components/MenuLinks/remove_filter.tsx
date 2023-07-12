import React from "react";
import filterUpdateLink, {filterIteratorMap, ModifierState} from "@/utils/url/filter";
import {FilterState} from "@/utils/mongo/request_data";


function noFiltersSet(): React.ReactElement {
    return (
        <div className="flex flex-col" key={"empty"}>
            <h2 className={`text-3xl text-tvblue font-semibold`}>No filters set</h2>
        </div>
    )
}


type RemoveFilterMenuInput = {
    modifierState: ModifierState,
    filterState: FilterState
}

export default function RemoveFilterMenu({modifierState, filterState}: RemoveFilterMenuInput): React.ReactElement {
    const filterIterator = filterIteratorMap(filterState)
    if (filterIterator.size === 0) {
        return noFiltersSet()
    }
    return (
        <div>
            {Array.from(filterIterator.entries()).map(([filterKey, filterValues]) => (
                <div key={"remove filter type" + filterKey}>
                    <div className="text-2xl text-tvgrey">
                        {filterKey}
                    </div>
                    {filterValues.map((filterValue) => (
                        <div
                            className="text-xl text-tvorange hover:text-tvgrey hover:bg-stopred border-tvblue hover:border-tvyellow border-2 rounded-md p-1 m-1"
                            key={"remove filter link " + filterKey + filterValue}
                        >
                            {filterUpdateLink(modifierState, filterState, filterKey, filterValue, false)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}