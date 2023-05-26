from api.mongo.operate import MongoOperate
from api.survey.find import find_all_data, all_found_action_types


def upload_all_data(verbose: bool = True, collection_name: str = 'all_data', remove_old_data: bool = False):
    """Upload all data to the mongoDB database"""
    with MongoOperate(verbose=verbose, database_name_to_select='files',
                      collection_name_to_select=collection_name) as mongo:
        # drop the old data if requested
        if remove_old_data:
            mongo.collection_remove_if_exists(collection_name=collection_name)
        # upload all the data from the generator to the database
        all_data = find_all_data(verbose=verbose, generator_mode=True)
        for record in all_data['smurf']:
            mongo.post(document=record.to_dict())
        # add indexes to the database to make sorting faster
        mongo.collection_add_index(index_name='time_stamp_course', ascending=False, unique=False)
        mongo.collection_add_index(index_name='time_stamp', ascending=False, unique=False)
        mongo.collection_add_index(index_name='ufm_number', ascending=True, unique=False)
        mongo.collection_add_index(index_name='action_type', ascending=True, unique=False)


def get_action_data(action: str, verbose: bool = True, collection_name: str = 'all_data'):
    with MongoOperate(verbose=verbose, database_name_to_select='files',
                      collection_name_to_select=collection_name) as mongo:
        matching_data = list(mongo.find_matching(name='action_type', value=action))
        return matching_data


if __name__ == '__main__':
    # upload_all_data(verbose=True, collection_name='all_data', remove_old_data=True)
    matching_data = get_action_data(action='take_iv', verbose=True, collection_name='all_data')
