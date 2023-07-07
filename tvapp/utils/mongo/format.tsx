import * as mongoDB from "mongodb";
import mongo from "mongodb";


export async function mapBy(cursorPerAction: mongoDB.FindCursor, keyType: string) : Promise<Map<number, Array<object>>> {
    const documents: Array<object> = await cursorPerAction.toArray();
    let byTimestamp: Map<number, Array<object>> = new Map();
    for (let doc of documents) {
        // @ts-ignore
        const keyValue = doc[keyType]
        if (byTimestamp.has(keyValue)) {
            // @ts-ignore
            byTimestamp.get(keyValue).push(doc)
        } else {
            byTimestamp.set(keyValue, [doc])
        }
    }
    return byTimestamp
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