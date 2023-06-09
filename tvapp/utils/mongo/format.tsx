import * as mongoDB from "mongodb";


export async function mapBy(cursorPerAction: mongoDB.FindCursor, keyType: string) : Promise<Map<number, Array<object>>> {
    const documents: Array<object> = await cursorPerAction.toArray();
    console.log(documents)
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
