import os
from time import time
from typing import List, Dict, Tuple, NamedTuple, Optional, Union

from api.mongo.configs import SMURF_DATA_DIR
from api.mongo.configs import USE_RELATIVE_PATH, EXPECTED_OUTPUT_DIR_NAMES, SEND_PROCESS_STATUS, \
    EXTRA_TIME_SECONDS_FOR_COARSE_TIME

from api.survey.logging import log_excluded_dir


all_found_action_types = set()


def convert_coarse_time_to_timestamp(coarse_time: int) -> int:
    return int(str(coarse_time) + '00000')


def get_timestamp_max_from_now() -> int:
    return int(time()) + 1


def get_time_dirs(parent_dir: str) -> List[int]:
    return [int(time_dir) for time_dir in os.listdir(parent_dir) if time_dir.isdigit()]


def get_ufm_dirs(parent_dir: str) -> List[str]:
    return [time_dir for time_dir in os.listdir(parent_dir) if time_dir.lower().startswith('ufm')]


def parse_ufm_name(ufm_dir: str) -> Tuple[str, int]:
    ufm_dir = ufm_dir.lower().strip()
    _, dir_info = ufm_dir.split('_')
    ufm_letter, ufm_number_str = dir_info.split('v')
    return ufm_letter, int(ufm_number_str)


def parse_action_name(action_dir: str) -> Tuple[Union[int, None], str]:
    timestamp_str, action_type = action_dir.split('_', 1)
    if timestamp_str.lower().strip() == 'none':
        timestamp = None
    else:
        timestamp = int(timestamp_str)
    return timestamp, action_type


def get_results_files(parent_dir: str) -> Dict[str, List[str]]:
    # the only expected dir inside the action dir is 'outputs'
    found_dirs = set()
    data_files_by_type = {}
    for output_dir in os.listdir(parent_dir):
        if output_dir not in EXPECTED_OUTPUT_DIR_NAMES:
            raise ValueError(f"Unexpected dir name {output_dir} inside {parent_dir}")
        found_dirs.add(output_dir)
        full_path_output_dir = os.path.join(parent_dir, output_dir)
        data_files_by_type[output_dir] = os.listdir(full_path_output_dir)
    for not_found_dir in EXPECTED_OUTPUT_DIR_NAMES - found_dirs:
        data_files_by_type[not_found_dir] = None
    return data_files_by_type


class SmurfDataLocation(NamedTuple):
    timestamp_coarse: int
    timestamp: int
    ufm_letter: str
    ufm_number: int
    action_type: str
    path: str
    ufm_label: str
    outputs: Optional[List[str]] = None
    plots: Optional[List[str]] = None

    def to_dict(self) -> Dict[str, Union[int, str, List[str], None]]:
        return {field: getattr(self, field) for field in self._fields}


data_scraper_functions = {}


def data_scraper(func):
    name_type = func.__name__
    data_scraper_functions[name_type] = func
    return func


@data_scraper
def smurf(timestamp_min: int, timestamp_max: int, smurf_data_path: str, verbose: bool = False):
    if verbose:
        print(f"  Scrapping smurf data from {smurf_data_path}")
    for coarse_time_int in get_time_dirs(parent_dir=smurf_data_path):
        coarse_timestamp_for_compare_min = convert_coarse_time_to_timestamp(coarse_time_int)
        coarse_timestamp_for_compare_max = coarse_timestamp_for_compare_min + 100000 \
                                            + EXTRA_TIME_SECONDS_FOR_COARSE_TIME
        if coarse_timestamp_for_compare_min < timestamp_min or coarse_timestamp_for_compare_max > timestamp_max:
            # the data is likely to be outside the data is outside the requested time range
            continue
        full_path_coarse_time_dir = os.path.join(smurf_data_path, str(coarse_time_int))
        for ufm_dir in get_ufm_dirs(parent_dir=full_path_coarse_time_dir):
            ufm_letter, ufm_number = parse_ufm_name(ufm_dir)
            full_path_ufm_dir = os.path.join(full_path_coarse_time_dir, ufm_dir)
            for action_dir in os.listdir(full_path_ufm_dir):
                full_path_action_dir = os.path.join(full_path_ufm_dir, action_dir)
                timestamp_int, action_type = parse_action_name(action_dir)
                if isinstance(timestamp_int, int):
                    if timestamp_int < timestamp_min or timestamp_int > timestamp_max:
                        # this data is outside the requested time range
                        continue
                else:
                    # this is a special case where the timestamp is None
                    # add this file to the ignored folders database
                    log_excluded_dir(dir_type='smurf', dir_path=full_path_action_dir,
                                     reason='Not able to parse timestamp, timestamp was None')
                    continue
                data_files_by_type = get_results_files(parent_dir=full_path_action_dir)
                all_found_action_types.add(action_type)
                if USE_RELATIVE_PATH:
                    path_trimmed = full_path_action_dir.replace(smurf_data_path, 'smurf')
                else:
                    path_trimmed = full_path_action_dir
                # convert the path to use forward slashes instead of backslashes (a Windows issue)
                path_formatted = path_trimmed.replace('\\', '/')
                if not path_formatted.endswith('/'):
                    path_formatted = path_formatted + '/'
                yield SmurfDataLocation(
                    timestamp_coarse=coarse_time_int,
                    timestamp=timestamp_int,
                    ufm_letter=ufm_letter,
                    ufm_number=ufm_number,
                    action_type=action_type,
                    path=path_formatted,
                    ufm_label=f"{ufm_letter.upper()}v{ufm_number}",
                    outputs=data_files_by_type['outputs'],
                    plots=data_files_by_type['plots'],
                )


def find_data(timestamp_min: int, timestamp_max: int,
              level3_data_dir: str, verbose: bool = False, generator_mode: bool = True) -> Dict[str, List[str]]:
    data_locations_single_dir = {}
    for possible_dir in os.listdir(level3_data_dir):
        # only parse directories that are in the data_scraper_functions dictionary
        dir_str = possible_dir.lower()
        full_dir_path = os.path.join(level3_data_dir, possible_dir)
        if os.path.isdir(full_dir_path) and dir_str in data_scraper_functions.keys():
            if generator_mode:
                data_locations_this_dir = data_scraper_functions[dir_str](timestamp_min, timestamp_max,
                                                                          full_dir_path, verbose=verbose)
            else:
                data_locations_this_dir = list(data_scraper_functions[dir_str](timestamp_min, timestamp_max,
                                                                               full_dir_path, verbose=verbose))
            if dir_str in data_locations_single_dir.keys():
                data_locations_single_dir[dir_str].extend(data_locations_this_dir)
            else:
                data_locations_single_dir[dir_str] = data_locations_this_dir
    return data_locations_single_dir


def find_all_data(verbose: bool = False, generator_mode: bool = True,
                  timestamp_min: Optional[int] = None, timestamp_max: Optional[int] = None,
                  ) -> Dict[str, List[SmurfDataLocation]]:
    data_locations_all = {}
    if timestamp_min is None:
        timestamp_min = 0
    if timestamp_max is None:
        timestamp_max = int(time()) + 1
    if SMURF_DATA_DIR is not None:
        level3_data_dir = os.path.dirname(SMURF_DATA_DIR)
        data_locations_single_dir = find_data(timestamp_min=timestamp_min, timestamp_max=timestamp_max,
                                              level3_data_dir=level3_data_dir, verbose=verbose,
                                              generator_mode=generator_mode)
        for dir_str, data_locations_this_dir in data_locations_single_dir.items():
            if dir_str in data_locations_all.keys():
                data_locations_all[dir_str].extend(data_locations_this_dir)
            else:
                data_locations_all[dir_str] = data_locations_this_dir
    return data_locations_all


if __name__ == '__main__':
    data_locations_all_test = find_all_data(verbose=True, generator_mode=False)
