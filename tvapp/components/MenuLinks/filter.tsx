import React from "react";
import Link from 'next/link';
import mongo from "mongodb";

const rangeDataTypes = new Set(['document_range', 'timestamp_range'])
export type FilterState = Map<string, Set<number | string>>


export const documentLimitDefault = 100


function parseNumber(testNumberString: string): string | number {
    let testNumber: number
    if (testNumberString.includes(".")) {
        testNumber =  parseFloat(testNumberString)
    } else {
        testNumber =  parseInt(testNumberString)
    }
    if (isNaN(testNumber)) {
        return testNumberString
    } else {
        return testNumber
    }
}


function parseSingleModifier(singleModifier: string): [string, Set<number | string>] {
    const [modifierType, modifierValues] = singleModifier.split("%24")
    let valuesList: Array<number | string>
    if (modifierValues.includes("%2B")) {
        valuesList = modifierValues.split("%2B")
    } else if (modifierValues.includes("%2D")) {
        valuesList = modifierValues.split("%2D")
    } else {
        valuesList = [modifierValues]

    }
    const convertedSet = new Set(valuesList.map((testNumberString): number | string => {
        if (typeof testNumberString === "number") {
            return testNumberString
        } else {
            return parseNumber(testNumberString)
        }
    }))
    return [modifierType, convertedSet]
}


function parseModifierString(modifierString: string): FilterState {
    if (modifierString === "") {
        return new Map()
    }
    const [modifierPrefix, ...modifiers] = modifierString.split("*")
    return new Map(modifiers.map((singleModifier): [string, Set<number | string>] => {
        return parseSingleModifier(singleModifier)
    }))

}


export function parseFilterURL(filterURL: Array<string> | undefined, verbose: boolean = false): [FilterState, FilterState] {
    let queryString = ""
    if (filterURL !== undefined && filterURL.length > 0) {
        queryString = queryString + filterURL[0]
    }
    const paramsStrings = queryString.split("!")
    const modifierState = parseModifierString(paramsStrings[0])
    let filterState : FilterState = new Map()
    if (paramsStrings.length > 1) {
        for (let i = 1; i < paramsStrings.length; i++) {
            const singleModifier = paramsStrings[i]
            const [param, valuesList] = parseSingleModifier(singleModifier)
            filterState.set(param, valuesList)
        }
    }
    if (verbose) {console.log("Parsed Query:", filterState)}
    return [modifierState, filterState]
}


function getStringArray(valueArray: Array<string | number> | Set<string | number> | undefined): Array<string> {
    if (valueArray === undefined) {
        return []
    }
    return (
        Array.from(valueArray).map((value: string | number): string => {
        if (typeof value === "number") {
            return value.toString()
        } else {
            return value
        }})
    )
}


function encodeToURL(someState: FilterState, primaryOperator: string = "!", secondaryOperator: string = "$"): string {
    let stateURL = ""
    for (let key of Array.from(someState.keys())) {
        const valueSet = someState.get(key)
        let arrayOperator = "+"
        if (someState.size === 2 && rangeDataTypes.has(key)) {
            arrayOperator = "-"
        }
        const stringValues = getStringArray(valueSet)
        const joinedValues = stringValues.join(arrayOperator)
        if (joinedValues.length > 0) {
            stateURL += primaryOperator + key + secondaryOperator + joinedValues
        }
    }
    return stateURL
}


export function genFilterURL(modifierState: FilterState, filterState: FilterState): string {
    let filterURL = encodeToURL(modifierState, "*", "$")
    filterURL += encodeToURL(filterState, "!", "$")
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


export function getCurrentIndexRange(modifierState: FilterState): [number, number] {
    let startIndex = 0
    let endIndex = documentLimitDefault
    const rangeValuesSet = modifierState.get('document_range')
    if (rangeValuesSet !== undefined) {
        const rangeValues = Array.from(rangeValuesSet)
        if (rangeValues.length === 1) {
            const singleValue = rangeValues[0]
            if (typeof singleValue === 'number') {
                startIndex = singleValue
                endIndex = startIndex
            }
        } else if (rangeValues.length === 2) {
            const firstValue = rangeValues[0]
            const secondValue = rangeValues[1]
            if (typeof firstValue === 'number' && typeof secondValue === 'number') {
                startIndex = firstValue
                endIndex = secondValue
            }
        }
    }
    return [startIndex, endIndex]
}


export default function filterUpdateLink(
    modifierState: FilterState,
    filterState: FilterState,
    filterKey: string,
    filterValue: string | number,
    toAdd: boolean = true): React.ReactNode {
    const newModifierState = new Map(modifierState)
    if (newModifierState.has('document_range')) {
        newModifierState.delete('document_range')
    }
    let uri: string
    if (toAdd) {
        uri = genFilterURL(newModifierState, addFilter(filterState, filterKey, filterValue))
    } else
      {
        uri = genFilterURL(newModifierState, subtractFilter(filterState, filterKey, filterValue))
      }
    return (
        <Link href={uri}
              className="group rounded-lg border border-transparent  transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              key={"Filter_database_" + uri}>
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
