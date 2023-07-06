import {GetCursorPerFilterInput} from "@/utils/mongo/query";
import React from "react";
import filterUpdateLink, {ModifierState} from "@/utils/url/filter";

export function noFiltersSet(): React.ReactElement {
    return (
        <div className="flex flex-col" key={"empty"}>
            <h2 className={`text-3xl text-tvblue font-semibold`}>No filters set</h2>
        </div>
    )
}


type nonEmptyFilterTypes = Array<string> | Array<number> | Array<[number, number]>
type FilterIteratorMapInput = Map<string, nonEmptyFilterTypes>;


function filterIteratorMap(filterState: GetCursorPerFilterInput): FilterIteratorMapInput {
    const sortedFilterKeys = Object.keys(filterState).sort()
    const extractionMap: FilterIteratorMapInput = new Map();
    for ( const [filterName, filterValues] of Object.entries(filterState)) {
        let filterValues: nonEmptyFilterTypes = []
        let valuesFound = true
        switch (filterName) {
            case "action_type":
                if (filterState.action_type !== undefined) {
                    filterValues = Array.from(filterState.action_type)
                }
                break
            case "timestamp":
                if (filterState.timestamp !== undefined) {
                    filterValues = Array.from(filterState.timestamp)
                }
                break
            case "timestamp_coarse":
                if (filterState.timestamp_coarse !== undefined) {
                    filterValues = Array.from(filterState.timestamp_coarse)
                }
                break
            case "ufm_number":
                if (filterState.ufm_number !== undefined) {
                    filterValues = Array.from(filterState.ufm_number)
                }
                break
            case "ufm_letter":
                if (filterState.ufm_letter !== undefined) {
                    filterValues = Array.from(filterState.ufm_letter)
                }
                break
            case "timestamp_range":
                if (filterState.timestamp_range !== undefined) {
                    filterValues = filterState.timestamp_range
                }
                break
            default:
                valuesFound = false
                break
        }
        if (valuesFound) {
            extractionMap.set(filterName, filterValues)
        }
    }
    const orderedMap: FilterIteratorMapInput = new Map()
    for (const filterName of sortedFilterKeys) {
        const filterValues = extractionMap.get(filterName)
        if (filterValues !== undefined) {
            orderedMap.set(filterName, filterValues)
        }
    }
    return orderedMap
}


export function RemoveFilterMenu({modifierState, filterState} : {modifierState: ModifierState, filterState: GetCursorPerFilterInput})
    : React.ReactElement {
    // const { isRemoveFilterMenuOpen, setIsRemoveFilterMenuOpen} = useContext(QueryContext)
    const filterIterator = filterIteratorMap(filterState)
    if (filterIterator.size === 0) {
        return noFiltersSet()
    }
    return (
        <div>
            {Array.from(filterIterator.entries()).map(([filterKey, filterValues]) => (
                <div key={"remove filter type" + filterKey}>
                    <div>
                        <h2>{filterKey}</h2>
                    </div>
                    {filterValues.map((filterValue) => (
                        <div key={"remove filter link " + filterKey + filterValue}>
                            {filterUpdateLink(modifierState, filterState, filterKey, filterValue, false)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
