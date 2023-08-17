from typing import Dict, Union

from api.mongo.operate import MongoOperate


class DatabaseState:
    database = 'states'
    default_doc_by_state_type = {
        'scan': {'last_scan_min_timestamp': 0.0},
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


def set_min_timestamp_for_scan_smurf(scan_timestamp_min: float):
    db_state = DatabaseState(collection_name='smurf', state_type='scan', verbose=True)
    last_scan_min_timestamp = db_state.get_state()['last_scan_min_timestamp']
    if scan_timestamp_min != float('inf') and scan_timestamp_min > last_scan_min_timestamp:
        db_state.update_state(update_map={'last_scan_min_timestamp': scan_timestamp_min})


def get_min_timestamp_for_scan_smurf():
    db_state = DatabaseState(collection_name='smurf', state_type='scan', verbose=True)
    last_scan_min_timestamp = db_state.get_state()['last_scan_min_timestamp']
    return last_scan_min_timestamp


if __name__ == '__main__':
    import time
    db_state_example = DatabaseState(collection_name='test', state_type='scan', verbose=True)
    print(db_state_example.get_state())

    set_min_timestamp_for_scan_smurf(scan_timestamp_min=time.time())
