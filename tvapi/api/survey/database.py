from time import time, sleep
from datetime import datetime, timezone
from typing import Union, Optional

import numpy as np

from api.mongo.operate import MongoOperate
from api.survey.post_status import post_status, allowed_task_types
from api.survey.find import find_all_data, convert_coarse_time_to_timestamp
from api.survey.database_states import set_min_timestamp_for_scan_smurf, get_min_timestamp_for_scan_smurf
from tvapi.settings import REPORTS_STATUS_TIMEOUT_SECONDS, REPORTS_STATUS_MINIMUM_WAIT_SECONDS, VERBOSE


def get_action_data(action: str, verbose: bool = True, collection_name: str = 'all_data'):
    with MongoOperate(verbose=verbose, database_name_to_select='files',
                      collection_name_to_select=collection_name) as mongo:
        matching_data = list(mongo.find_matching(name='action_type', value=action))
        return matching_data


class DatabaseEvent:
    status_timeout_seconds = REPORTS_STATUS_TIMEOUT_SECONDS

    def __init__(self, event_type: str,
                 timestamp_min: Optional[Union[datetime, int, float, None]] = None,
                 timestamp_max: Optional[Union[datetime, int, float, None]] = None,
                 from_last_scan: bool = False,
                 verbose: bool = True):
        self.verbose = verbose
        self.from_last_scan = from_last_scan
        # verify the event type
        self.event_type = event_type.lower().strip()
        if self.event_type not in allowed_task_types:
            raise ValueError(f'invalid event_type ({self.event_type}), allowed types: {allowed_task_types}')
        # convert min timestamp to an int
        if timestamp_min is None:
            timestamp_min = 0
        elif isinstance(timestamp_min, float):
            # int() acts as a floor function
            timestamp_min = int(timestamp_min)
        elif isinstance(timestamp_min, datetime):
            timestamp_min = int(timestamp_min.timestamp())
        self.timestamp_min = timestamp_min
        # convert max timestamp to an int
        now = time()
        if timestamp_max is None:
            timestamp_max = int(now)
        elif isinstance(timestamp_max, float):
            # int() acts as a floor function
            timestamp_max = int(timestamp_max)
        elif isinstance(timestamp_max, datetime):
            timestamp_max = int(timestamp_max.timestamp())
        timestamp_max += 1
        # verify the timestamps
        if timestamp_min > timestamp_max:
            timestamp_max, timestamp_min = timestamp_min, timestamp_max
        elif timestamp_min == timestamp_max:
            raise ValueError(f'timestamp_min ({timestamp_min}) == timestamp_max ({timestamp_max})')
        if timestamp_max > now + 2:
            raise ValueError(f'timestamp_max ({timestamp_max}) is in the future, now: {now}')
        if timestamp_min < 0:
            raise ValueError(f'timestamp_min ({timestamp_min}) is negative')
        self.timestamp_max = timestamp_max

        # variables used or set in send_status()
        self.delta_time_total = None
        self.last_status_time = 0.0
        self.last_percent_complete = 0.0
        self.lowest_timestamp_coarse_found = None

        # finally, trigger the appropriate event
        if self.event_type == 'update_from_modification_time':
            raise NotImplementedError(f'event_type ({self.event_type}) not implemented yet')
        elif self.event_type in {'update', 'update_recent'}:
            self.update_data()
        elif self.event_type == 'full_reset':
            self.upload_data()

    def send_status(self, status_type: str, is_complete: bool = False, timestamp_coarse: Optional[int] = None):
        if is_complete:
            # send the completion status immediately
            delta_last_send = time() - self.last_status_time
            if delta_last_send > REPORTS_STATUS_MINIMUM_WAIT_SECONDS:
                # do not span the serve with status updates
                sleep(delta_last_send - REPORTS_STATUS_MINIMUM_WAIT_SECONDS)
            post_status(status_type=status_type, is_complete=is_complete, verbose=self.verbose)
            self.last_percent_complete = 100.0
        else:
            # send the status if enough time has passed
            now = time()
            if now - self.last_status_time > self.status_timeout_seconds:
                self.last_status_time = now
                if timestamp_coarse is None:
                    post_status(status_type=status_type,  percent_complete=0.0, verbose=self.verbose)
                    self.last_percent_complete = 0.0
                else:
                    # convert the coarse time to a timestamp, adding the appropriate number of digits.
                    timestamp_coarse = convert_coarse_time_to_timestamp(timestamp_coarse)
                    # is the current timestamp the lowest time stamp found?
                    if self.delta_time_total is None or self.lowest_timestamp_coarse_found is None:
                        self.lowest_timestamp_coarse_found = timestamp_coarse
                        self.delta_time_total = self.timestamp_max - self.lowest_timestamp_coarse_found
                    elif timestamp_coarse < self.lowest_timestamp_coarse_found:
                        self.lowest_timestamp_coarse_found = timestamp_coarse
                        self.delta_time_total = (self.timestamp_max - self.lowest_timestamp_coarse_found)
                    # calculate the percent complete and send the status
                    delta_time_complete = (timestamp_coarse - self.lowest_timestamp_coarse_found)
                    percent_complete = np.round((delta_time_complete / self.delta_time_total) * 100.0, decimals=2)
                    if percent_complete != self.last_percent_complete:
                        # do not send the same status twice
                        post_status(status_type=status_type, percent_complete=percent_complete, verbose=self.verbose)
                        self.last_percent_complete = percent_complete

    def smurf_reset_collection(self):
        collection_name = 'smurf'
        with MongoOperate(verbose=self.verbose, database_name_to_select='files',
                          collection_name_to_select=collection_name) as mongo:
            # drop the old data (if exists)
            mongo.collection_remove_if_exists(collection_name=collection_name)
            # add indexes to the database to make sorting faster
            mongo.collection_add_index(index_name='timestamp_coarse', ascending=False, unique=False)
            mongo.collection_add_index(index_name='timestamp', ascending=False, unique=False)
            mongo.collection_add_index(index_name='ufm_number', ascending=True, unique=False)
            mongo.collection_add_index(index_name='action_type', ascending=True, unique=False)
            mongo.collection_add_index(index_name='stream_id', ascending=True, unique=False)
            mongo.collection_add_index(index_name='platform', ascending=True, unique=False)
            mongo.collection_compound_index(index_dict={
                'platform': 1,
                'timestamp_coarse': -1,
                'stream_id': 1,
                'action_type': 1,
                'timestamp': -1,
            }, unique=True)

    def smurf_upload(self):
        collection_name = 'smurf'
        all_data = find_all_data(verbose=self.verbose, generator_mode=True,last_modified_min=None,
                                 timestamp_min=self.timestamp_min, timestamp_max=self.timestamp_max)
        if collection_name not in all_data.keys():
            raise ValueError(f'collection_name ({collection_name}) not found in all_data.keys()')
        with MongoOperate(verbose=self.verbose, database_name_to_select='files',
                          collection_name_to_select=collection_name) as mongo:
            status_type = f'scan_{collection_name}'
            self.send_status(status_type=status_type, is_complete=False, timestamp_coarse=None)
            scan_timestamp_min = float('inf')
            for record in all_data[collection_name]:
                scan_timestamp_min = min(scan_timestamp_min, record.scan_timestamp)
                mongo.post(document=record.to_dict())
                self.send_status(status_type=status_type, timestamp_coarse=record.timestamp_coarse)
        set_min_timestamp_for_scan_smurf(scan_timestamp_min=scan_timestamp_min)
        self.send_status(status_type=status_type, is_complete=True)

    def smurf_update(self):
        collection_name = 'smurf'
        if self.from_last_scan:
            last_modified_min = get_min_timestamp_for_scan_smurf()
        else:
            last_modified_min = None
        all_data = find_all_data(verbose=self.verbose, generator_mode=True, last_modified_min=last_modified_min,
                                 timestamp_min=self.timestamp_min, timestamp_max=self.timestamp_max)
        if collection_name not in all_data.keys():
            raise ValueError(f'collection_name ({collection_name}) not found in all_data.keys()')
        with MongoOperate(verbose=self.verbose, database_name_to_select='files',
                          collection_name_to_select=collection_name) as mongo:
            status_type = f'scan_{collection_name}'
            self.send_status(status_type=status_type, is_complete=False, timestamp_coarse=None)
            scan_timestamp_min = float('inf')
            for record in all_data[collection_name]:
                scan_timestamp_min = min(scan_timestamp_min, record.scan_timestamp)
                document = record.to_dict()
                unique_index = {
                    'platform': record.platform,
                    'timestamp_coarse': record.timestamp_coarse,
                    'stream_id': record.stream_id,
                    'action_type': record.action_type,
                    'timestamp': record.timestamp,
                }
                mongo.update_or_insert_one(doc_filter=unique_index, update_map=document)
                self.send_status(status_type=status_type, timestamp_coarse=record.timestamp_coarse)
            set_min_timestamp_for_scan_smurf(scan_timestamp_min=scan_timestamp_min)
            self.send_status(status_type=status_type, is_complete=True)

    def upload_data(self):
        self.smurf_reset_collection()
        self.smurf_upload()

    def update_data(self):
        self.smurf_update()


def get_max_timestamp() -> float:
    max_timestamp = 0.0
    with MongoOperate(verbose=VERBOSE, database_name_to_select='files',
                      collection_name_to_select='smurf') as mongo:
        found_timestamp = mongo.get_max_value(field_name='timestamp')
        if found_timestamp is not None:
            max_timestamp = max(max_timestamp, found_timestamp)
    return max_timestamp


def do_full_reset(timestamp_min: Optional[Union[datetime, int, float, None]] = None,
                  timestamp_max: Optional[Union[datetime, int, float, None]] = None,):
    DatabaseEvent(event_type='full_reset',
                  timestamp_min=timestamp_min,
                  timestamp_max=timestamp_max,
                  verbose=VERBOSE)


def do_update():
    DatabaseEvent(event_type='update',
                  timestamp_min=None,
                  timestamp_max=None,
                  verbose=VERBOSE)


def do_update_recent(from_last_scan: bool = False):
    three_course_timestamps_in_the_past = max(0, int(get_max_timestamp() - 300000))
    DatabaseEvent(event_type='update_recent',
                  timestamp_min=three_course_timestamps_in_the_past,
                  timestamp_max=None,
                  from_last_scan=from_last_scan,
                  verbose=VERBOSE)


def do_update_from_modification_time():
    do_update_recent(from_last_scan=True)


if __name__ == '__main__':
    DatabaseEvent(event_type='full_reset',
                  timestamp_min=datetime(2020, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
                  timestamp_max=time(),
                  verbose=True)
