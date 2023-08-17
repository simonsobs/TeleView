import datetime
from typing import Optional, Dict, Union

from pymongo import ReturnDocument

from api.mongo.connect import MongoConnection


class MongoOperate(MongoConnection):
    test_database_name = 'test_db'
    test_collection_name = 'test_collection'
    test_document = {
        "author": "Caleb Wheeler",
        "text": "My first blog post!",
        "tags": ["mongodb", "python", "pymongo"],
        "date": datetime.datetime.utcnow()
    }

    def database_remove_if_exists(self, database_name: Optional[str]):
        """Remove a database"""
        self.select_database(database_name_to_select=database_name)
        if self.database_exists(self.selected_db_name):
            self.client.drop_database(self.selected_db_name)
            if self.database_exists(self.selected_db_name):
                raise Exception(f'Database {self.selected_db_name} was not removed (dropped).')
            elif self.verbose:
                print(f'Database {self.selected_db_name} removed (dropped).')
        else:
            if self.verbose:
                print(f'Database {self.selected_db_name} does not exist, nothing to remove.')

    def collection_remove_if_exists(self, collection_name: str, database_name: Optional[str] = None):
        if self.collection_exists(collection_name=collection_name, database_name=database_name):
            db = self.get_database(database_name=database_name)
            db.drop_collection(collection_name)
            if self.collection_exists(collection_name=collection_name, database_name=database_name):
                raise Exception(f'Collection {self.selected_db_name}.{self.selected_collection_name} ' +
                                'as not removed (dropped).')
            elif self.verbose:
                print(f'Collection {self.selected_db_name}.{self.selected_collection_name} removed (dropped).')
        else:
            if self.verbose:
                print(f'Collection {self.selected_db_name}.{self.selected_collection_name} does not exist, ' +
                      'nothing to remove.')

    def find_or_create(self, doc_filter: Dict[str, any], default_doc: Dict[str, any],
                       collection_name: Optional[str] = None, database_name: Optional[str] = None) \
            -> Dict[str, any]:
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        # return None if the document does not exist
        return collection.find_one_and_update(filter=doc_filter,
                                              update={'$setOnInsert': default_doc},
                                              upsert=True,  # insert the document if it does not exist
                                              return_document=ReturnDocument.AFTER,  # return the document after update
                                              )

    def post(self, document, collection_name: Optional[str] = None, database_name: Optional[str] = None):
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        collection.insert_one(document)

    def update_or_insert_one(self, doc_filter: Dict[str, any], update_map: Dict[str, any],
                             collection_name: Optional[str] = None, database_name: Optional[str] = None):
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        collection.update_one(filter=doc_filter, update={"$set": update_map}, upsert=True)

    def get_max_value(self, field_name: str, collection_name: Optional[str] = None,
                      database_name: Optional[str] = None) -> Union[float, None]:
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "maxQty": {"$max": f"${field_name}"}
                },
            },
            {
                "$project": {
                    "_id": 0,
                },
            },
        ]
        return_list = list(collection.aggregate(pipeline=pipeline))
        if len(return_list) == 0:
            return None
        else:
            return return_list[0]['maxQty']

    def initialize_test_data(self):
        self.collection_remove_if_exists(collection_name=self.test_collection_name,
                                         database_name=self.test_database_name)
        self.post(document=self.test_document, collection_name=self.test_collection_name,
                  database_name=self.test_database_name)
        if self.verbose:
            print('Test data initialized.')

    def collection_add_index(self, index_name: str, ascending: bool = True, unique: bool = False,
                             collection_name: Optional[str] = None, database_name: Optional[str] = None):
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        collection.create_index([(index_name, 1 if ascending else -1)], unique=unique)

    def collection_compound_index(self, index_dict: Dict[str, int], unique: bool = False,
                                  collection_name: Optional[str] = None, database_name: Optional[str] = None):
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        collection.create_index(list(index_dict.items()), unique=unique)


def get_max_timestamp() -> float:
    max_timestamp = 0.0
    with MongoOperate(verbose=True, database_name_to_select='files',
                      collection_name_to_select='smurf') as mongo:
        found_timestamp = mongo.get_max_value(field_name='timestamp')
        if found_timestamp is not None:
            max_timestamp = max(max_timestamp, found_timestamp)
    return max_timestamp


if __name__ == '__main__':
    # import pprint
    #
    # with MongoOperate(verbose=True, database_name_to_select='test_db',
    #                   collection_name_to_select='test_collection') as mongo:
    #     mongo.initialize_test_data()
    #     example_collection = mongo.get_collection()
    #     pprint.pprint(example_collection.find_one())
    test = get_max_timestamp()
