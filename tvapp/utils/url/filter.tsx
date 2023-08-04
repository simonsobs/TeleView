import React from "react";
import Link from 'next/link';

import {FilterState} from "@/utils/mongo/request_data";
import {TELEVIEW_DEFAULT_ITEMS_PER_PAGE} from "@/utils/config";
import {simplifyRanges, timestampToIsoString} from "@/utils/time/time";


const rangeModifierDataTypes = new Set(['document_range'])
export type ModifierState = { [key: string] : Set<number | string> | [number, number] }


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
    const [modifierPrefix, ...modifiers] = modifierString.split("~")
    return Object.fromEntries(modifiers.map((singleModifier): [string, Set<number | string> | [number, number]] => {
        const [modifierType, modifierValuesString] = singleModifier.split("%24")  // $
        if (rangeModifierDataTypes.has(modifierType)) {
            const parseDocumentRange = parseModifierRanges(modifierValuesString)
            if (parseDocumentRange.length > 0) {
                return [modifierType, parseDocumentRange[0]]
            } else {
                console.log("failed to parse document range")
                return [modifierType, [0, TELEVIEW_DEFAULT_ITEMS_PER_PAGE]]
            }
        } else {
            return [modifierType, parseSingleModifier(modifierValuesString)]
        }
    }))

}


export function parseFilterURL(filterURL: Array<string> | undefined, verbose: boolean = false)
    : [ModifierState, FilterState] {
    let queryString = ""
    if (filterURL !== undefined && filterURL.length > 0) {
        queryString = queryString + filterURL[0]
    }
    const paramsStrings = queryString.split("!")
    const modifierState = parseModifierString(paramsStrings[0])
    let filterState : FilterState = {
        action_type: undefined,
        timestamp: undefined,
        timestamp_coarse: undefined,
        ufm_letter: undefined,
        ufm_number: undefined,
        stream_id: undefined,
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
                case "stream_id":
                    filterState.stream_id = parseSingleModifierString(modifierValuesString)
                    break;
                case "timestamp_range":
                    filterState.timestamp_range = simplifyRanges(parseModifierRanges(modifierValuesString))
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
            if (Array.isArray(valueSet) && valueSet.length === 2 && rangeModifierDataTypes.has(key)) {
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

function encodeToURLFilter(filterState: FilterState, primaryOperator: string = "!", secondaryOperator: string = "$"): string {
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
            case "stream_id":
                stateURL += encodeToURFilterKeyValue(key, filterState.stream_id, primaryOperator, secondaryOperator)
                break;
            case "timestamp_range":
                let simplifiedTimeStampRange: Array<[number, number]> | undefined = undefined
                if (filterState.timestamp_range !== undefined) {
                    simplifiedTimeStampRange = simplifyRanges(filterState.timestamp_range)
                }
                stateURL += encodeToURFilterKeyValue(key, simplifiedTimeStampRange, primaryOperator, secondaryOperator)
                break;
            default:
                break;
        }
    }
    return stateURL
}


export function genFilterURL(modifierState: ModifierState, filterState: FilterState): string {
    let filterURL = "/" + encodeToURLModifier(modifierState, "~", "$")
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
            const valuesSet = new Set(currentFilterValues)
            if (valuesSet.has(targetValue)) {
                const newFilterValues = [...Array.from(currentFilterValues).filter((value: string) => value !== targetValue)]
                if (newFilterValues.length === 0) {
                    return undefined
                } else {
                    return new Set(newFilterValues)
                }
            } else {
                return valuesSet
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


function addSubtractFilter(filterState: FilterState, filterKey: string, filterValue: string | number | [number, number], add: boolean = false)
    : FilterState {
    const newFilterState: FilterState = { ...filterState }
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
        case "stream_id":
            if (typeof filterValue === "string") newFilterState.stream_id = addSubtractFilterString(filterValue, filterState.stream_id, add)
            break;
        case "timestamp_range":
            if (typeof filterValue === "object") newFilterState.timestamp_range = addSubtractFilterRange(filterValue, filterState.timestamp_range, add)
            break;
        default:
            break;
    }
    return newFilterState
}


export function getCurrentIndexRange(modifierState: ModifierState, documentLimit: number | undefined): [number, number] {
    let startIndex = 0
    let endIndex: number
    if (typeof documentLimit === 'undefined') {
        endIndex = TELEVIEW_DEFAULT_ITEMS_PER_PAGE
    } else {
        endIndex = documentLimit
    }

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
                                filterState: FilterState,
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
    filterState: FilterState,
    filterKey: string,
    filterValue: string | number | [number, number],
    toAdd: boolean = true): React.ReactElement {

    const bulletString = toAdd ? "+" : "-"
    let filterValueString : string | React.ReactElement = ''
    if (typeof filterValue === "string") {
        filterValueString = bulletString + " " + filterValue
    } else if (typeof filterValue === "number") {
        filterValueString = bulletString + " " + filterValue.toString()
    } else if (Array.isArray(filterValue)) {
        const startTime = filterValue[0]
        const endTime = filterValue[1]
        filterValueString = (
            <div className="flex flex-col">
                <div>
                    {bulletString + " " + "(" + startTime.toString() + ", " + endTime.toString() + ")"}
                </div>

                <div>
                    {"(" + timestampToIsoString(startTime) + ", " + timestampToIsoString(endTime) + ")"}
                </div>
            </div>

        )
    }

    const uri = filterUpdateURI(modifierState, filterState, filterKey, filterValue, toAdd)
    return (
        <Link href={uri}
            rel="noopener noreferrer"
            key={"Filter_database_" + uri}
            prefetch={false}
        >
            {filterValueString}
        </Link>
    )
}

type nonEmptyFilterTypes = Array<string> | Array<number> | Array<[number, number]>
type FilterIteratorMapInput = Map<string, nonEmptyFilterTypes>;


export function filterIteratorMap(filterState: FilterState): FilterIteratorMapInput {
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
            case "stream_id":
                if (filterState.stream_id !== undefined) {
                    filterValues = Array.from(filterState.stream_id)
                    console.log("FilterIteratorMap: stream_id: ", filterValues)
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
