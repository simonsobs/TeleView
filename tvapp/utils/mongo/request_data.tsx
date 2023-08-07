import mongo from "mongodb";
import * as mongoDB from "mongodb";

import clientPromise from "@/utils/mongo/client";
import { primary_database, primary_collection, TELEVIEW_VERBOSE } from "@/utils/config";



// database, collection, and query utilities
async function getCollection(databaseName : string = primary_database,
                             collectionName: string = primary_collection) :
    Promise<mongoDB.Collection> {
    const client = await clientPromise
    return client.db(databaseName).collection(collectionName);
}


// Individual MongoDB queries
async function listDatabases() : Promise<mongoDB.ListDatabasesResult> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListDatabase")
    }
    const client = await clientPromise
    return client.db().admin().listDatabases();
}


async function listDistinct(key: string, databaseName : string, collectionName: string) : Promise<Array<string | number>> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListDistinct: ", key)
    }
    const collection = await getCollection(databaseName, collectionName)
    return collection.distinct(key);
}


async function listActionTypes() : Promise<Array<string>> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListActionTypes")
    }
    const collection = await getCollection()
    return collection.distinct('action_type');
}


async function listCoarseTimestamps() : Promise<Array<number>> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListCoarseTimestamps")
    }
    const collection = await getCollection()
    const timestamps = await collection.distinct('timestamp_coarse');
    return timestamps.map((x: string) => parseInt(x));
}


// Wrapper function for MongoDB queries
async function mongoQuery(query: () => any) : Promise<any> {
    try {
        return query()
    } catch (e) {
        console.error("Error in MongoQuery:", e);
    }
}


// scripts for data retrieval
export default async function getDataMap(databaseName : string = primary_database,
                                         collectionName: string = primary_collection) : Promise<Map<string, any>> {
    const actionTypesPromise = mongoQuery(listActionTypes)
    const coarseTimestampsPromise = mongoQuery(listCoarseTimestamps)
    const timestampsPromise = mongoQuery(() => listDistinct('timestamp', databaseName, collectionName))
    const streamIdPromise = mongoQuery(() => listDistinct('stream_id', databaseName, collectionName))
    const platformPromise = mongoQuery(() => listDistinct('platform', databaseName, collectionName))
    const promiseArray  = await Promise.all([
        actionTypesPromise,
        coarseTimestampsPromise,
        timestampsPromise,
        streamIdPromise,
        platformPromise,
    ]);
    return new Map([
        ["actionTypes", promiseArray[0]],
        ["coarseTimestamps", promiseArray[1]],
        ["timestamps", promiseArray[2]],
        ["streamIDs", promiseArray[3]],
        ["platforms", promiseArray[4]],
    ])
}



type MongoFindFilter = {[key: string]: string | number | {[key: string]: any} | Array<any>}


function wrapFilter(wrapType: string, filters: Array<any>): MongoFindFilter {
    if (filters.length === 1) {
        return filters[0]
    } else if (filters.length === 0) {
        return {}
    } else {
        return {[wrapType]: filters}
    }
}


function getMatchFilter(matchType: string, match: string | number | Set< string | number >): MongoFindFilter {
    let matchObject: MongoFindFilter | string | number
    if (typeof match === 'string' || typeof match === 'number') {
        matchObject =  match
    } else {
        matchObject = wrapFilter('$in', Array.from(match))
    }
    return {[matchType]: matchObject}
}


function getRangeFilter(targetName: string, ranges: Array<[number, number]>): MongoFindFilter {
    const rangeArray = ranges.map((range: [number, number]) => {
        return {[targetName]: {'$gte': range[0], '$lte': range[1]}}
    })
    return wrapFilter('$or', rangeArray)
}


export type FilterState = {
    action_type: undefined | Set<string>,
    timestamp: undefined | Set<number>,
    timestamp_coarse: undefined | Set<number>,
    ufm_letter: undefined  | Set<string>,
    ufm_number: undefined | Set<number>,
    stream_id: undefined | Set<string>,
    platform: undefined | Set<string>
    timestamp_range: undefined | Array<[number, number]>
}



export async function getCursorPerFilter(
    {
        action_type,
        timestamp,
        timestamp_coarse,
        ufm_letter,
        ufm_number,
        stream_id,
        platform,
        timestamp_range
    }: FilterState )
    : Promise<mongoDB.FindCursor> {
    let andFilters: Array<MongoFindFilter> = []
    if (action_type) {andFilters.push(getMatchFilter('action_type', action_type))}
    if (timestamp) {andFilters.push(getMatchFilter('timestamp', timestamp))}
    if (timestamp_coarse) {andFilters.push(getMatchFilter('timestamp_coarse', timestamp_coarse))}
    if (ufm_letter) {andFilters.push(getMatchFilter('ufm_letter', ufm_letter))}
    if (ufm_number) {andFilters.push(getMatchFilter('ufm_number', ufm_number))}
    if (stream_id) {andFilters.push(getMatchFilter('stream_id', stream_id))}
    if (platform) {andFilters.push(getMatchFilter('platform', platform))}
    if (timestamp_range) {andFilters.push(getRangeFilter('timestamp', timestamp_range))}
    const filter = wrapFilter('$and', andFilters)
    const singleActionQuery = async (): Promise<mongoDB.FindCursor> => {
        if (TELEVIEW_VERBOSE) {
            console.log("  Query: getCursorPerFilter, Filter: ", filter)
        }
        const collection = await getCollection()
        return collection.find(filter).sort({'timestamp': -1, 'platform': 1, 'ufm_number': 1})
    }
    return await mongoQuery(singleActionQuery)
}


export async function returnDocumentsSlice(start: number = 0, end: number = 100, dataCursor: mongo.FindCursor): Promise<[Array<mongo.Document>, number]> {
    const docArray: Array<mongo.Document> = []
    let breakIndex: number | undefined = undefined
    for (let i = 0; i < end; i++) {
        if (!await dataCursor.hasNext()) {
            breakIndex = i
            break
        }
        const doc = await dataCursor.next()
        if (i >= start) {
            doc['_id'] = doc['_id'].toString()
            docArray.push(doc)
        }
    }
    // find the max length of the cursor
    if (breakIndex === undefined) {
        let count = end
        while (await dataCursor.hasNext()) {
            await dataCursor.next()
            count += 1
        }
        breakIndex = count
    }
    return [docArray, breakIndex]
}
