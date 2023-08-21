from typing import Optional, Union, Any

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
from pymongo.errors import ServerSelectionTimeoutError

from tvapi.settings import CONNECTION_STRING_DEFAULT


class MongoConnection:
    """MongoDB Connection to a database"""
    connection_string_default = CONNECTION_STRING_DEFAULT
    database_illegal_chars = {' ', '.', '$', '/', '\\', '\'', '"', '*', '<', '>', ':', '|', '?'}

    def __init__(self, connection_uri: str = connection_string_default, verbose: bool = False,
                 database_name_to_select: Optional[str] = None, collection_name_to_select: Optional[str] = None):
        self.verbose = verbose
        if connection_uri is None:
            connection_uri = self.connection_string_default
        print(f'connection_uri: {connection_uri}')
        self.connection_uri = connection_uri
        # set in the select_database method
        self.selected_db_name = None
        # set in the select_collection method
        self.selected_collection_name = None
        # set in the __enter__ method
        self.client = None
        # set in the test_connection method
        self.server_info = None
        # automatically select a database if one is provided
        if database_name_to_select is not None:
            self.select_database(database_name_to_select)
        if collection_name_to_select is not None:
            self.select_collection(collection_name_to_select)

    def __enter__(self):
        self.client = MongoClient(self.connection_uri)
        self.test_connection()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.client.close()

    def test_connection(self):
        try:
            self.server_info = self.client.server_info()
        except ServerSelectionTimeoutError:
            raise ServerSelectionTimeoutError('Could not connect to the MongoDB server using the connection uri:\n' +
                                              f'{self.connection_uri}\ncheck the uri, ' +
                                              'check if the MongoDB server is running.')
        if self.verbose:
            print(f'Connected to MongoDB server version {self.server_info["version"]}')
            
    def name_format(self, name_str: str, is_collection: bool = False) -> str:
        if name_str is None:
            raise ValueError('Python\'s None value is not a valid database or collection name.')
        name_str = name_str.strip().lower().replace(' ', '_')
        name_charter_set = set(list(name_str))
        if name_str == '':
            raise ValueError('Empty string is not a valid database or collection name.')
        elif name_charter_set.intersection(self.database_illegal_chars):
            raise ValueError(f'Illegal characters the database or collection name:\n' +
                             f'{name_charter_set.intersection(self.database_illegal_chars)}')
        elif is_collection:
            # collection names cannot start with 'system.'
            if name_str.startswith('system.'):
                raise ValueError(f'Collection names cannot start with "system, got {name_str}"')
        else:
            # database names have a charter limit of 64
            if len(name_str) > 64:
                raise ValueError(f'Database names cannot be longer than 64 characters, got {name_str} with length ' +
                                 f'{len(name_str)}')
        return name_str

    def select_database(self, database_name_to_select: str):
        self.selected_db_name = self.name_format(name_str=database_name_to_select)

    def select_collection(self, collection_name_to_select: str):
        self.selected_collection_name = self.name_format(name_str=collection_name_to_select, is_collection=True)

    def select(self, collection_name: Optional[str] = None, database_name: Optional[str] = None):
        if database_name is not None:
            self.select_database(database_name_to_select=database_name)
        if collection_name is not None:
            self.select_collection(collection_name_to_select=collection_name)

    def get_database(self, database_name: Optional[str] = None) -> Database:
        if database_name is not None:
            self.select_database(database_name_to_select=database_name)
        return self.client[self.selected_db_name]

    def get_collection(self, collection_name: Optional[str] = None, database_name: Optional[str] = None) -> Collection:
        db = self.get_database(database_name=database_name)
        if collection_name is not None:
            self.select_collection(collection_name_to_select=collection_name)
        return db[self.selected_collection_name]

    def database_exists(self, database_name: Optional[str] = None) -> bool:
        """Check if a database exists"""
        if database_name is not None:
            self.select_database(database_name_to_select=database_name)
        return self.selected_db_name in self.client.list_database_names()

    def collection_exists(self, collection_name: Optional[str] = None, database_name: Optional[str] = None) -> bool:
        """Check if a collection exists"""
        db = self.get_database(database_name=database_name)
        if collection_name is not None:
            self.select_collection(collection_name_to_select=collection_name)
        return self.selected_collection_name in db.list_collection_names()

    def find_matching(self, name: str, value: Union[str, int, float, None],
                      collection_name: Optional[str] = None, database_name: Optional[str] = None) -> Any:
        self.select(collection_name=collection_name, database_name=database_name)
        collection = self.get_collection()
        return collection.find({name: value})


if __name__ == '__main__':
    import pprint
    with MongoConnection(verbose=True, database_name_to_select='test_db',
                         collection_name_to_select='test_collection') as mongo:
        pprint.pprint(mongo.server_info)
