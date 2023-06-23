from time import time, sleep
from datetime import datetime, timezone
from typing import Union, Optional

import numpy as np

from api.mongo.operate import MongoOperate
from api.survey.post_status import post_status, allowed_status_types
from api.mongo.configs import REPORTS_STATUS_TIMEOUT_SECONDS, REPORTS_STATUS_MINIMUM_WAIT_SECONDS, VERBOSE
from api.survey.find import find_all_data, convert_coarse_time_to_timestamp


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
                 verbose: bool = True):
        self.verbose = verbose
        # verify the event type
        self.event_type = event_type.lower().strip()
        if self.event_type not in allowed_status_types:
            raise ValueError(f'invalid event_type ({self.event_type}), allowed types: {allowed_status_types}')
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
        if self.event_type == 'scan_smurf':
            self.upload_data(collection_name='smurf', remove_old_data=True)

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

    def upload_data(self, collection_name: str = 'smurf', remove_old_data: bool = False):
        """Upload all data to the mongoDB database"""
        with MongoOperate(verbose=self.verbose, database_name_to_select='files',
                          collection_name_to_select=collection_name) as mongo:
            status_type = f'scan_{collection_name}'
            self.send_status(status_type=status_type, is_complete=False, timestamp_coarse=None)
            # drop the old data if requested
            if remove_old_data:
                mongo.collection_remove_if_exists(collection_name=collection_name)
            # upload all the data from the generator to the database
            all_data = find_all_data(verbose=self.verbose, generator_mode=True,
                                     timestamp_min=self.timestamp_min, timestamp_max=self.timestamp_max)
            for record in all_data[collection_name]:
                mongo.post(document=record.to_dict())
                self.send_status(status_type=status_type, timestamp_coarse=record.timestamp_coarse)
            # add indexes to the database to make sorting faster
            mongo.collection_add_index(index_name='timestamp_coarse', ascending=False, unique=False)
            mongo.collection_add_index(index_name='timestamp', ascending=False, unique=False)
            mongo.collection_add_index(index_name='ufm_number', ascending=True, unique=False)
            mongo.collection_add_index(index_name='action_type', ascending=True, unique=False)
            self.send_status(status_type=status_type, is_complete=True)


def do_scan_smurf(timestamp_min: Optional[Union[datetime, int, float, None]] = None,
                  timestamp_max: Optional[Union[datetime, int, float, None]] = None,):
    DatabaseEvent(event_type='scan_smurf',
                  timestamp_min=timestamp_min,
                  timestamp_max=timestamp_max,
                  verbose=VERBOSE)


if __name__ == '__main__':
    DatabaseEvent(event_type='scan_smurf',
                  timestamp_min=datetime(2020, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
                  timestamp_max=time(),
                  verbose=True)
