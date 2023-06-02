const {MongoClient} = require('mongodb');

const mongoURI = 'mongodb://user:pass@localhost:27016/?authMechanism=DEFAULT'
const primary_database = 'files'
const primary_collection = 'all_data'

const client = new MongoClient(mongoURI);


export async function MongoOpen() : Promise<any> {
    console.log("Opening MongoClient Connection")
    return client.connect();
}


export async function MongoClose() : Promise<any> {
    console.log("Closing MongoClient Connection ")
    return client.close();
}


export async function ListDatabases(client: typeof MongoClient) : Promise<any> {
    console.log("  Query: ListDatabase")
    return client.db().admin().listDatabases();
}


export async function MongoQuery(Query: (client: typeof MongoClient) => any) : Promise<any> {
    try {
        return Query(client)
    } catch (e) {
        console.error("Error in MongoQuery:", e);
    }
}


export default async function GetDataMap() : Promise<any> {
    const databaseListPromise = MongoQuery(ListDatabases)
    return Promise.all([databaseListPromise]);
}
