from typing import Dict, Union

from api.mongo.operate import MongoOperate


class DatabaseState:
    database = 'states'
    default_doc_by_state_type = {
        'smurf_scan': {'last_modified': 0.0},
        'scan': {'last_modified': 0.0},
    }

    def __init__(self, collection_name: str = 'test', state_type: str = 'scan', verbose: bool = True):
        self.collection_name = collection_name.lower().strip()
        self.state_type = state_type.lower().strip()
        self.verbose = verbose

        with MongoOperate(verbose=self.verbose, database_name_to_select=self.database,
                          collection_name_to_select=self.collection_name) as mongo:
            if not (mongo.database_exists() and mongo.collection_exists()):
                mongo.collection_add_index(index_name='state', ascending=True, unique=True)

    def get_state(self) -> Union[Dict[str, any], None]:
        found_doc = None
        with MongoOperate(verbose=self.verbose, database_name_to_select=self.database,
                          collection_name_to_select=self.collection_name) as mongo:
            if self.state_type not in self.default_doc_by_state_type:
                raise ValueError(f'state_type ({self.state_type}) not in default_doc_by_state_type')
            default_doc = self.default_doc_by_state_type[self.state_type]
            default_doc['state'] = self.state_type
            found_doc = mongo.find_or_create(doc_filter={'state': self.state_type}, default_doc=default_doc)
        return found_doc

    def update_state(self, update_map: Dict[str, any]):
        with MongoOperate(verbose=self.verbose, database_name_to_select=self.database,
                          collection_name_to_select=self.collection_name) as mongo:
            mongo.update_or_insert_one(doc_filter={'state': self.state_type}, update_map=update_map)


if __name__ == '__main__':
    db_state = DatabaseState(collection_name='test', state_type='scan', verbose=True)
    print(db_state.get_state())
