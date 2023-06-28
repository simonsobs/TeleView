const {MongoClient} = require('mongodb');
import * as mongoDB from "mongodb";
import {mongoURI, primary_database, primary_collection, TELEVIEW_VERBOSE} from "@/utils/config";
import clientPromise from "@/utils/mongo/client";


// database, collection, and query utilities
async function getCollection(database : string = primary_database,
                             collection: string = primary_collection) :
    Promise<mongoDB.Collection> {
    const client = await clientPromise
    return client.db(database).collection(collection);
}


// Individual MongoDB queries
async function listDatabases() : Promise<mongoDB.ListDatabasesResult> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListDatabase")
    }
    const client = await clientPromise
    return client.db().admin().listDatabases();
}


async function listActionTypes() : Promise<Array<string>> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListActionTypes")
    }
    const collection = await getCollection()
    return collection.distinct('action_type');
}


async function listCoarseTimeStamps() : Promise<Array<number>> {
    if (TELEVIEW_VERBOSE) {
        console.log("  Query: ListCoarseTimeStamps")
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
export default async function getDataMap() : Promise<Map<string, any>> {
    const actionTypesPromise = mongoQuery(listActionTypes)
    const coarseTimeStampsPromise = mongoQuery(listCoarseTimeStamps)
    const promiseArray  = await Promise.all([actionTypesPromise, coarseTimeStampsPromise]);
    return new Map([
        ["actionTypes", promiseArray[0]],
        ["coarseTimeStamps", promiseArray[1]]
    ])
}

export async function listTimesPerAction(action_type: string) : Promise<Array<number>> {
    const singleActionQuery = async (): Promise<Array<number>> => {
        if (TELEVIEW_VERBOSE) {
            console.log("  Query: ListTimesPerAction: ", action_type)
        }
        const collection = await getCollection()
        const timestamps = await collection.distinct('timestamp', {'action_type': action_type});
        return timestamps.map((x: string) => parseInt(x));
    }
    return await mongoQuery(singleActionQuery)
}

function getFilterElement(element: string | number | Array< string | number >) : string | number | { '$in': Array<string | number> } {
    if (typeof element === 'string') {
        return element
    } else if (typeof element === 'number') {
        return element
    }
    return {'$in': element}
}
export async function getCursorPerFilter(action_type: string | undefined | Array< string | number >,
                                        timestamp: number | undefined | Array< string | number >,
                                        timestamp_coarse: number | undefined | Array< string | number >,
                                        ufm_letter: string | undefined  | Array< string | number >,
                                        ufm_number: number | undefined | Array< string | number >) : Promise<mongoDB.FindCursor> {
    let filter : {[key: string]: string | number | { '$in': Array<string | number> }} = {}
    if (action_type) {filter['action_type'] = getFilterElement(action_type)}
    if (timestamp) {filter['timestamp'] = getFilterElement(timestamp)}
    if (timestamp_coarse) {filter['timestamp_coarse'] = getFilterElement(timestamp_coarse)}
    if (ufm_letter) {filter['ufm_letter'] = getFilterElement(ufm_letter)}
    if (ufm_number) {filter['ufm_number'] = getFilterElement(ufm_number)}
    const singleActionQuery = async (): Promise<mongoDB.FindCursor> => {
        if (TELEVIEW_VERBOSE) {
            console.log("  Query: getCursorPerFilter, Filter: ", filter)
        }
        const collection = await getCollection()
        return collection.find(filter);
    }
    return await mongoQuery(singleActionQuery)
}
