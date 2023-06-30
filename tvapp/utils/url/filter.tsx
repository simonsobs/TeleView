import React from "react";
import Link from 'next/link';

import {GetCursorPerFilterInput} from "@/utils/mongo/query";
import { documentLimitDefault } from "@/utils/config";

const rangeModifierDataTypes = new Set(['document_range'])
export type ModifierState = { [key: string] : Set<number | string | [number, number]> }



function parseNumber(numberString: string): number {
    if (numberString.includes(".")) {
        return parseFloat(numberString)
    } else {
        return parseInt(numberString)
    }
}


function parseNumberOrString(testNumberString: string): string | number {
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


function getValuedStings(modifierValuesString: string): Array<string> {
    let valueStrings: Array<string>
    if (modifierValuesString.includes("%2B")) { // +
        valueStrings = modifierValuesString.split("%2B") // +
    } else if (modifierValuesString.includes("%2D")) { // -
        valueStrings = modifierValuesString.split("%2D") // -
    } else {
        valueStrings = [modifierValuesString]
    }
    return valueStrings
}


function parseSingleModifierNumber(modifierValuesString: string): Set<number> {
    const valueStrings = getValuedStings(modifierValuesString)
    return new Set(valueStrings.map((testNumberString): number => {
        return parseNumber(testNumberString)
    }))
}


function parseSingleModifierString(modifierValuesString: string): Set<string> {
    return new Set(getValuedStings(modifierValuesString))
}


function parseSingleModifier(modifierValuesString: string): Set<number | string> {
    const valueStrings = getValuedStings(modifierValuesString)
    return new Set(valueStrings.map((testNumberString): number | string => {
        return parseNumberOrString(testNumberString)
    }))
}


function parseRangeStrings(rangeStrings: Array<string>): Array<[number, number]> {
    let valuesList: Array<[number, number]> = []
    for (let rangValue of rangeStrings) {
        if (rangValue.includes("-")) {
            const [minString, maxSting] = rangValue.split("-")
            if (minString !== undefined && maxSting !== undefined) {
                const min = parseNumberOrString(minString)
                const max = parseNumberOrString(maxSting)
                if (typeof min === "number" && typeof max === "number") {
                    if (min > max) {
                        valuesList.push([max, min])
                    } else {
                        valuesList.push([min, max])
                    }
                }
            }
        }
    }
    return valuesList
}

function parseModifierRanges(rangesString: string): Array<[number, number]> {
    const modifierIncludesPlus = rangesString.includes("%2B") // +
    const modifierIncludesMinus = rangesString.includes("-")
    if (modifierIncludesMinus && modifierIncludesPlus) {
        // for set that 1 or more ranges of values
        return Array.from(parseRangeStrings(rangesString.split("%2B"))) // +
    } else if (modifierIncludesMinus) {
        return Array.from(parseRangeStrings([rangesString]))
    } else{
        return []
    }
}


function parseModifierString(modifierString: string): ModifierState {
    if (modifierString === "") {
        return {}
    }
    const [modifierPrefix, ...modifiers] = modifierString.split("*")
    return Object.fromEntries(modifiers.map((singleModifier): [string, Set<number | string | [number, number]>] => {
        const [modifierType, modifierValuesString] = singleModifier.split("%24")  // $
        return [modifierType, parseSingleModifier(singleModifier)]
    }))

}


export function parseFilterURL(filterURL: Array<string> | undefined, verbose: boolean = false)
    : [ModifierState, GetCursorPerFilterInput] {
    let queryString = ""
    if (filterURL !== undefined && filterURL.length > 0) {
        queryString = queryString + filterURL[0]
    }
    const paramsStrings = queryString.split("!")
    const modifierState = parseModifierString(paramsStrings[0])
    let filterState : GetCursorPerFilterInput = {
        action_type: undefined,
        timestamp: undefined,
        timestamp_coarse: undefined,
        ufm_letter: undefined,
        ufm_number: undefined,
        timestamp_range: undefined,
    }
    if (paramsStrings.length > 1) {
        for (let i = 1; i < paramsStrings.length; i++) {
            const singleModifier = paramsStrings[i]
            const [modifierType, modifierValuesString] = singleModifier.split("%24") // $
            switch (modifierType) {
                case "action_type":
                    filterState.action_type = parseSingleModifierString(modifierValuesString)
                    break;
                case "timestamp":
                    filterState.timestamp = parseSingleModifierNumber(modifierValuesString)
                    break;
                case "timestamp_coarse":
                    filterState.timestamp_coarse = parseSingleModifierNumber(modifierValuesString)
                    break;
                case "ufm_letter":
                    filterState.ufm_letter = parseSingleModifierString(modifierValuesString)
                    break;
                case "ufm_number":
                    filterState.ufm_number = parseSingleModifierNumber(modifierValuesString)
                    break;
                case "timestamp_range":
                    filterState.timestamp_range = parseModifierRanges(modifierValuesString)
                    break;
                default:
                    break;
            }
        }
    }
    if (verbose) {console.log("Parsed Query:", filterState)}
    return [modifierState, filterState]
}


function getStringArray(valueArray: Array<string | number | [number, number]> | Set<string | number | [number, number]> | undefined)
    : Array<string> {
    if (valueArray === undefined) {
        return []
    }
    return (
        Array.from(valueArray).map((value: string | number | [number, number]): string => {
            if (typeof value === "number") {
                return value.toString()
            } else if (Array.isArray(value)) {
                return value[0].toString() + "-" + value[1].toString()
            } else {
                return value
            }
        })
    )
}


function encodeToURLModifier(modifierState: ModifierState, primaryOperator: string = "!", secondaryOperator: string = "$"): string {
    let stateURL = ""
    const alphabeticallySortedKeys = Object.keys(modifierState).sort()
    for (let key of alphabeticallySortedKeys) {
        const valueSet = modifierState[key]
        let arrayOperator = "+"
        if (valueSet !== undefined) {
            if (valueSet.size === 2 && rangeModifierDataTypes.has(key)) {
                arrayOperator = "-"
            }
            const stringValues = getStringArray(valueSet)
            const joinedValues = stringValues.join(arrayOperator)
            if (joinedValues.length > 0) {
                stateURL += primaryOperator + key + secondaryOperator + joinedValues
            }
        }
    }
    return stateURL
    }


function encodeToURFilterKeyValue(key: string, valueSet: undefined | Set<string | number> | Array<[number, number]>, primaryOperator: string = "!", secondaryOperator: string = "$"): string {
    let stateURL = ""
    if (valueSet === undefined) {
        return stateURL
    }
    const stringValues = getStringArray(valueSet)
    const joinedValues = stringValues.join("+")
    if (joinedValues.length > 0) {
        stateURL += primaryOperator + key + secondaryOperator + joinedValues
    }
    return stateURL
}

function encodeToURLFilter(filterState: GetCursorPerFilterInput, primaryOperator: string = "!", secondaryOperator: string = "$"): string {
    let stateURL = ""
    const alphabeticallySortedKeys = Object.keys(filterState).sort()
    for (let key of alphabeticallySortedKeys) {
        switch (key) {
            case "action_type":
                stateURL += encodeToURFilterKeyValue(key, filterState.action_type, primaryOperator, secondaryOperator)
                break;
            case "timestamp":
                stateURL += encodeToURFilterKeyValue(key, filterState.timestamp, primaryOperator, secondaryOperator)
                break;
            case "timestamp_coarse":
                stateURL += encodeToURFilterKeyValue(key, filterState.timestamp_coarse, primaryOperator, secondaryOperator)
                break;
            case "ufm_letter":
                stateURL += encodeToURFilterKeyValue(key, filterState.ufm_letter, primaryOperator, secondaryOperator)
                break;
            case "ufm_number":
                stateURL += encodeToURFilterKeyValue(key, filterState.ufm_number, primaryOperator, secondaryOperator)
                break;
            case "timestamp_range":
                stateURL += encodeToURFilterKeyValue(key, filterState.timestamp_range, primaryOperator, secondaryOperator)
                break;
            default:
                break;
        }
    }
    return stateURL
}


export function genFilterURL(modifierState: ModifierState, filterState: GetCursorPerFilterInput): string {
    let filterURL = "/" + encodeToURLModifier(modifierState, "*", "$")
    filterURL += encodeToURLFilter(filterState, "!", "$")
    return filterURL
}


function addSubtractFilterNumber(targetValue: number, currentFilterValues: undefined | Set<number>, add: boolean = true) : undefined | Set<number> {
    if (add) {
        if (currentFilterValues === undefined) {
            return new Set([targetValue])
        } else {
            return new Set([...Array.from(currentFilterValues), targetValue])
        }
    } else {
        if (currentFilterValues === undefined) {
            return undefined
        } else {
            if (currentFilterValues.has(targetValue)) {
                const newFilterValues = [...Array.from(currentFilterValues).filter((value: number) => value !== targetValue)]
                if (newFilterValues.length === 0) {
                    return undefined
                } else {
                    return new Set(newFilterValues)
                }
            } else {
                return currentFilterValues
            }
        }
    }
}


function addSubtractFilterString(targetValue: string, currentFilterValues: undefined | Set<string>, add: boolean = true) : undefined | Set<string> {
    if (add) {
        if (currentFilterValues === undefined) {
            return new Set([targetValue])
        } else {
            return new Set([...Array.from(currentFilterValues), targetValue])
        }
    } else {
        if (currentFilterValues === undefined) {
            return undefined
        } else {
            if (currentFilterValues.has(targetValue)) {
                const newFilterValues = [...Array.from(currentFilterValues).filter((value: string) => value !== targetValue)]
                if (newFilterValues.length === 0) {
                    return undefined
                } else {
                    return new Set(newFilterValues)
                }
            } else {
                return currentFilterValues
            }
        }
    }
}


function addSubtractFilterRange(targetRange: [number, number], currentFilterValues: undefined | Array<[number, number]>, add: boolean = true) : undefined | Array<[number, number]> {
    if (add) {
        if (currentFilterValues === undefined) {
            return [targetRange]
        } else {
            return [...Array.from(currentFilterValues), targetRange]
        }
    } else {
        if (currentFilterValues === undefined) {
            return undefined
        } else {
            return [...Array.from(currentFilterValues).filter((value:  [number, number]) => value !== targetRange)]
        }
    }
}


function addSubtractFilter(filterState: GetCursorPerFilterInput, filterKey: string, filterValue: string | number | [number, number], add: boolean = false)
    : GetCursorPerFilterInput {
    const newFilterState: GetCursorPerFilterInput = { ...filterState }
    switch (filterKey) {
        case "action_type":
            if (typeof filterValue === "string") newFilterState.action_type = addSubtractFilterString(filterValue, filterState.action_type, add)
            break;
        case "timestamp":
            if (typeof filterValue === "number") newFilterState.timestamp = addSubtractFilterNumber(filterValue, filterState.timestamp, add)
            break;
        case "timestamp_coarse":
            if (typeof filterValue === "number") newFilterState.timestamp_coarse = addSubtractFilterNumber(filterValue, filterState.timestamp_coarse, add)
            break;
        case "ufm_letter":
            if (typeof filterValue === "string") newFilterState.ufm_letter = addSubtractFilterString(filterValue, filterState.ufm_letter, add)
            break;
        case "ufm_number":
            if (typeof filterValue === "number") newFilterState.ufm_number = addSubtractFilterNumber(filterValue, filterState.ufm_number, add)
            break;
        case "timestamp_range":
            if (typeof filterValue === "object") newFilterState.timestamp_range = addSubtractFilterRange(filterValue, filterState.timestamp_range, add)
            break;
        default:
            break;
    }
    return newFilterState
}


export function getCurrentIndexRange(modifierState: ModifierState): [number, number] {
    let startIndex = 0
    let endIndex = documentLimitDefault
    const rangeValuesSet = modifierState.document_range
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


export function filterUpdateURI(modifierState: ModifierState,
                                filterState: GetCursorPerFilterInput,
                                filterKey: string,
                                filterValue: string | number | [number, number],
                                add: boolean = false): string {
    const newModifierState: ModifierState = { ...modifierState}
    // reset the document range
    if ('document_range' in newModifierState) {
        delete newModifierState.document_range
    }
    // get the URL for these states
    return genFilterURL(newModifierState, addSubtractFilter(filterState, filterKey, filterValue, add))
}


export default function filterUpdateLink(
    modifierState: ModifierState,
    filterState: GetCursorPerFilterInput,
    filterKey: string,
    filterValue: string | number | [number, number],
    toAdd: boolean = true): React.ReactNode {
    const uri = filterUpdateURI(modifierState, filterState, filterKey, filterValue, toAdd)
    return (
        <Link href={uri}
              className="group rounded-lg border border-transparent  transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              key={"Filter_database_" + uri}
              prefetch={false}
        >
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
