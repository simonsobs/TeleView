from time import time

from api.mongo.operate import MongoOperate
from tvapi.settings import VERBOSE


def log_excluded_dir(dir_type: str, dir_path: str, reason: str = None):
    with MongoOperate(verbose=VERBOSE,
                      database_name_to_select='logs',
                      collection_name_to_select=f'{dir_type}_excluded_dir') as mongo:
        doc_filter = {'dir_type': dir_type, 'dir_path': dir_path, 'reason': reason}
        update_map = {'error_last_seen_timestamp': time()}
        mongo.update_or_insert_one(doc_filter=doc_filter, update_map=update_map)
