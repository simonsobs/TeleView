const {MongoClient} = require('mongodb');
import * as mongoDB from "mongodb";
import process from "process";


// default parameters
let mongoURI : string
if (process.env.NODE_ENV === 'production') {
    mongoURI = 'mongodb://user:pass@host.docker.internal:27016/?authMechanism=DEFAULT'
} else {
    mongoURI = 'mongodb://user:pass@localhost:27016/?authMechanism=DEFAULT'
}
console.log("Mongo URI:", mongoURI)
const primary_database = 'files'
const primary_collection = 'all_data'
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

async function listCourseTimeStamps(client: mongoDB.MongoClient) : Promise<Array<number>> {
    console.log("  Query: ListCourseTimeStamps")
    const collection = await getCollection(client)
    const time_stamps = await collection.distinct('time_stamp_course');
    return time_stamps.map((x: string) => parseInt(x));
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
    const courseTimeStampsPromise = mongoQuery(listCourseTimeStamps)
    const promiseArray  = await Promise.all([actionTypesPromise, courseTimeStampsPromise]);
    return new Map([
        ["actionTypes", promiseArray[0]],
        ["courseTimeStamps", promiseArray[1]]
    ])
}

export async function listTimesPerAction(action_type: string) : Promise<Array<number>> {
    const singleActionQuery = async (client: mongoDB.MongoClient): Promise<Array<number>> => {
        console.log("  Query: ListTimesPerAction: ", action_type)
        const collection = await getCollection(client)
        const time_stamps = await collection.distinct('time_stamp', {'action_type': action_type});
        return time_stamps.map((x: string) => parseInt(x));
    }
    return await mongoQuery(singleActionQuery)
}
