import React from "react";
import Link from 'next/link';

type FilterState = Map<string, Set<number | string>>



export function parseFilterURL(filterURL: Array<string> | undefined, verbose: boolean = false): [string, FilterState] {
    let queryString = ""
    if (filterURL !== undefined && filterURL.length > 0) {
        queryString = queryString + filterURL[0]
    }
    const paramsStrings = queryString.split("!")
    const modifierSting = paramsStrings[0]
    let filterState : FilterState = new Map()
    if (paramsStrings.length > 1) {
        for (let i = 1; i < paramsStrings.length; i++) {
            const [param, values] = paramsStrings[i].split("%24") // '$' is '%24'
            const valuesList = values.split("%2B")  // '+' is '%2B
            filterState.set(param, new Set(valuesList))
        }
    }
    if (verbose) {console.log("Parsed Query:", filterState)}
    return [modifierSting, filterState]
}


function genFilterURL(modifierSting: string, filterState: FilterState): string {
    let filterURL = modifierSting
    filterState.forEach((value, key) => {
        filterURL += "!" + key + "$"
        const stringValues: Array<string> = Array.from(value).map((value: string | number): string => {
            if (typeof value === "number") {
                return value.toString()
            }
            return value
        })
        filterURL += stringValues.join("+")
    })
    return filterURL
}


function addFilter(filterState: FilterState, filterKey: string, filterValue: string | number): FilterState {
    const newFilterState = new Map(filterState)
    if (newFilterState.has(filterKey)) {
        const filterValues = newFilterState.get(filterKey)
        if (filterValues !== undefined) {
            let newFilterValues = new Set(filterValues)
            newFilterValues.add(filterValue)
            if (newFilterValues.size === 0) {
                newFilterState.delete(filterKey)
            } else {
                newFilterState.set(filterKey, newFilterValues)
            }
        }
    } else {
        newFilterState.set(filterKey, new Set([filterValue]))
    }
    return newFilterState
}

function subtractFilter(filterState: FilterState, filterKey: string, filterValue: string | number): FilterState {
    const newFilterState = new Map(filterState)
    if (newFilterState.has(filterKey)) {
        const filterValues = newFilterState.get(filterKey)
        if (filterValues) {
            let newFilterValues = new Set(filterValues)
            newFilterValues.delete(filterValue)
            if (newFilterValues.size === 0) {
                newFilterState.delete(filterKey)
            } else {
                newFilterState.set(filterKey, newFilterValues)
            }
        }
    }
    return newFilterState
}



export default function filterUpdateLink(
    modifierSting: string,
    filterState: FilterState,
    filterKey: string,
    filterValue: string | number,
    toAdd: boolean = true): React.ReactNode {
    let uri: string
    if (toAdd) {
        uri = genFilterURL(modifierSting, addFilter(filterState, filterKey, filterValue))
    } else
      {
        uri = genFilterURL(modifierSting, subtractFilter(filterState, filterKey, filterValue))
      }
    return (
        <Link href={uri}
              className="group rounded-lg border border-transparent  transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              key={modifierSting + filterKey + (typeof filterValue === "number" ? filterValue.toString() : filterValue) + toAdd.toString() + uri}>
            <h2 className={`text-xl text-tvblue font-semibold`}>
                {toAdd
                    ?
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        +
                    </span>
                    :
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        -
                    </span>}
                {' ' + filterValue }

            </h2>
        </Link>
    )
}