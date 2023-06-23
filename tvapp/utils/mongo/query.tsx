import {timestamp} from "yaml/dist/schema/yaml-1.1/timestamp";

const {MongoClient} = require('mongodb');
import * as mongoDB from "mongodb";
import {mongoURI, primary_database, primary_collection, TELEVIEW_VERBOSE} from "@/utils/config";



// the client connection
const client = new MongoClient(mongoURI);
client.connect();


// context managers for opening and closing the client connection to MongoDB
export async function mongoOpen() : Promise<mongoDB.MongoClient> {
    console.log("Opening MongoClient Connection")
    return client.connect();
}


export async function mongoClose() : Promise<mongoDB.MongoClient> {
    console.log("Closing MongoClient Connection ")
    return client.close();
}


// database, collection, and query utilities
async function getCollection(client: mongoDB.MongoClient,
                             database : string = primary_database,
                             collection: string = primary_collection) :
    Promise<mongoDB.Collection> {
    // console.log("  Query: GetCollection: ", database + '.' + collection)
    return client.db(database).collection(collection);
}


// Individual MongoDB queries
async function listDatabases(client: mongoDB.MongoClient) : Promise<mongoDB.ListDatabasesResult> {
    console.log("  Query: ListDatabase")
    return client.db().admin().listDatabases();
}


async function listActionTypes(client: mongoDB.MongoClient) : Promise<Array<string>> {
    console.log("  Query: ListActionTypes")
    const collection = await getCollection(client)
    return collection.distinct('action_type');
}


async function listCoarseTimeStamps(client: mongoDB.MongoClient) : Promise<Array<number>> {
    console.log("  Query: ListCoarseTimeStamps")
    const collection = await getCollection(client)
    const timestamps = await collection.distinct('timestamp_coarse');
    return timestamps.map((x: string) => parseInt(x));
}


// Wrapper function for MongoDB queries
async function mongoQuery(query: (client: mongoDB.MongoClient) => any) : Promise<any> {
    try {
        return query(client)
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
    const singleActionQuery = async (client: mongoDB.MongoClient): Promise<Array<number>> => {
        console.log("  Query: ListTimesPerAction: ", action_type)
        const collection = await getCollection(client)
        const timestamps = await collection.distinct('timestamp', {'action_type': action_type});
        return timestamps.map((x: string) => parseInt(x));
    }
    return await mongoQuery(singleActionQuery)
}


export async function getCursorPerFilter(action_type: string | undefined,
                                        timestamp: number | undefined,
                                        timestamp_coarse: number | undefined,
                                        ufm_letter: string | undefined,
                                        ufm_number: number | undefined) : Promise<mongoDB.FindCursor> {
    let filter : {[key: string]: string | number} = {}
    if (action_type) {filter['action_type'] = action_type}
    if (timestamp) {filter['timestamp'] = timestamp}
    if (timestamp_coarse) {filter['timestamp_coarse'] = timestamp_coarse}
    if (ufm_letter) {filter['ufm_letter'] = ufm_letter}
    if (ufm_number) {filter['ufm_number'] = ufm_number}
    const singleActionQuery = async (client: mongoDB.MongoClient): Promise<mongoDB.FindCursor> => {
        console.log("  Query: getCursorPerFilter, Filter: ", filter)
        const collection = await getCollection(client)
        return collection.find(filter);
    }
    return await mongoQuery(singleActionQuery)
}
