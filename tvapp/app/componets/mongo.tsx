const {MongoClient} = require('mongodb');

const mongoURI = 'mongodb://user:pass@localhost:27016/?authMechanism=DEFAULT'


async function listDatabases(client: typeof MongoClient){
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    // @ts-ignore
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}


export default async function MongoTest() {
    const client = new MongoClient(mongoURI);

    try {
        await client.connect();

        await listDatabases(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}



