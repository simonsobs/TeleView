const {MongoClient} = require('mongodb');
import * as mongoDB from "mongodb";
import process from "process";


// default parameters
const mongoURI = 'mongodb://user:pass@localhost:27016/?authMechanism=DEFAULT'
const primary_database = 'files'
const primary_collection = 'all_data'


// the client connection
const client = new MongoClient(mongoURI);


// context managers for opening and closing the client connection to MongoDB
export async function MongoOpen() : Promise<mongoDB.MongoClient> {
    console.log("Opening MongoClient Connection")
    return client.connect();
}


export async function MongoClose() : Promise<mongoDB.MongoClient> {
    console.log("Closing MongoClient Connection ")
    return client.close();
}


// database, collection, and query utilities
async function GetCollection(client: mongoDB.MongoClient,
                             database : string = primary_database,
                             collection: string = primary_collection) :
    Promise<mongoDB.Collection> {
    console.log("  Query: GetCollection: ", database + '.' + collection)
    return client.db(database).collection(collection);
}


// Individual MongoDB queries
async function ListDatabases(client: mongoDB.MongoClient) : Promise<mongoDB.ListDatabasesResult> {
    console.log("  Query: ListDatabase")
    return client.db().admin().listDatabases();
}


async function ListActionTypes(client: mongoDB.MongoClient) : Promise<Array<string>> {
    console.log("  Query: ListActionTypes")
    const collection = await GetCollection(client)
    return collection.distinct('action_type');
}


// Wrapper function for MongoDB queries
async function MongoQuery(Query: (client: mongoDB.MongoClient) => any) : Promise<any> {
    try {
        return Query(client)
    } catch (e) {
        console.error("Error in MongoQuery:", e);
    }
}


// scripts for data retrieval
export default async function GetDataMap() : Promise<Array<any>> {
    const databaseListPromise = MongoQuery(ListDatabases)
    const actionTypesPromise = MongoQuery(ListActionTypes)
    return Promise.all([databaseListPromise, actionTypesPromise]);
}
