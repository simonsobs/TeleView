import os
from time import time
from itertools import chain
from typing import List, Dict, Tuple, NamedTuple, Optional, Union, Iterable

from api.survey.logger import log_excluded_dir
from tvapi.settings import PLATFORMS_DATA_DIR, USE_RELATIVE_PATH, EXPECTED_OUTPUT_DIR_NAMES, \
    EXTRA_TIME_SECONDS_FOR_COARSE_TIME


all_found_action_types = set()


def convert_coarse_time_to_timestamp(coarse_time: int) -> int:
    return int(str(coarse_time) + '00000')


def get_timestamp_max_from_now() -> int:
    return int(time()) + 1


def get_time_dirs(parent_dir: str) -> List[int]:
    return sorted([int(time_dir) for time_dir in os.listdir(parent_dir) if time_dir.isdigit()])


def get_ufm_dirs(parent_dir: str) -> List[str]:
    return [time_dir for time_dir in os.listdir(parent_dir) if time_dir.lower().startswith('ufm')]


def parse_ufm_name(ufm_dir: str) -> Tuple[str, int, str]:
    """
    Parses the UFM directory name and extracts substrings.

    Args:
        ufm_dir (str): The directory name in the format "ufm_{ufm_letter}v{ufm_number}".
        Example 1: "ufm_mv12"
        Example 2: "ufm_mv51r1"
        Example 3: "ufm_19"

    Returns:
        Tuple[str, int, str]: A tuple containing the ufm letter, ufm number as an int,
        and the formatted ufm label (which can retain non-numeric characters). If parsing
        fails, returns the input directory in the str fields and 0 for the ufm number.
        Example 1: ["m", 12, "Mv12"]
        Example 2: ["m", 51, "Mv51r1"]
        Example 3: ["ufm_19", 0, "ufm_19"]
    """
    try:
        ufm_dir = ufm_dir.lower().strip()
        _, dir_info = ufm_dir.split('_')
        ufm_letter, ufm_number = dir_info.split('v')
    except ValueError:
        return ufm_dir, 0, ufm_dir
    
    ufm_label = f'{ufm_letter.upper()}v{ufm_number}'

    # Handle cases where a directory name contains non-numeric characters after the ufm
    # number (e.g. the numeric prefix is "51" for directory "ufm_mv51r1"). If the numeric
    # prefix is empty (i.e. the directory name has no numeric characters), set number to 0.
    number_prefix = ufm_number[:len(ufm_number)-len(ufm_number.lstrip('0123456789'))]
    if len(number_prefix) == 0:
        ufm_number = 0
    else:
        ufm_number = int(number_prefix)

    return ufm_letter, ufm_number, ufm_label


def parse_action_name(action_dir: str) -> Tuple[Union[int, None], str]:
    timestamp_str, action_type = action_dir.split('_', 1)
    if timestamp_str.lower().strip() == 'none':
        timestamp = None
    else:
        timestamp = int(timestamp_str)
    return timestamp, action_type


def get_results_files(parent_dir: str = None, last_modified_min: Optional[Union[int, float, None]] = None
                      ) -> Tuple[float, Dict[str, List[str]]]:
    last_modified_max = 0.0
    found_dirs_full_path = set()
    data_files_by_type = {}
    for output_dir in os.listdir(parent_dir):
        if output_dir not in EXPECTED_OUTPUT_DIR_NAMES:
            raise ValueError(f"Unexpected dir name {output_dir} inside {parent_dir}")
        full_path_output_dir = os.path.join(parent_dir, output_dir)
        found_dirs_full_path.add(full_path_output_dir)
        last_modified_max = max(last_modified_max, os.path.getmtime(full_path_output_dir))
    found_and_modified_dirs = set()
    if last_modified_min is None or last_modified_min < last_modified_max:
        # this data is newer than the requested minimum last-modified-time
        for found_dir_full_path in found_dirs_full_path:
            found_dir = os.path.basename(found_dir_full_path)
            data_files_by_type[found_dir] = os.listdir(found_dir_full_path)
            found_and_modified_dirs.add(found_dir)
        # set nulls in the expected way
        for not_found_dir in EXPECTED_OUTPUT_DIR_NAMES - found_and_modified_dirs:
            data_files_by_type[not_found_dir] = None
    return last_modified_max, data_files_by_type


class SmurfDataLocation(NamedTuple):
    timestamp_coarse: int
    timestamp: int
    ufm_letter: str
    ufm_number: int
    action_type: str
    path: str
    ufm_label: str
    stream_id: str
    platform: str
    scan_timestamp: float = None
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
def smurf(timestamp_min: int, timestamp_max: int, smurf_data_path: str, platform: str,
          last_modified_min: Optional[Union[int, float, None]] = None, verbose: bool = False):
    if verbose:
        print(f"  Scrapping smurf data from {smurf_data_path}")
    for coarse_time_int in get_time_dirs(parent_dir=smurf_data_path):
        coarse_timestamp_for_compare_min = convert_coarse_time_to_timestamp(coarse_time_int)
        coarse_timestamp_for_compare_max = coarse_timestamp_for_compare_min + 100000 \
                                            + EXTRA_TIME_SECONDS_FOR_COARSE_TIME
        if coarse_timestamp_for_compare_max < timestamp_min or coarse_timestamp_for_compare_min > timestamp_max:
            # the data is outside the requested time range
            continue
        full_path_coarse_time_dir = os.path.join(smurf_data_path, str(coarse_time_int))
        for stream_id in get_ufm_dirs(parent_dir=full_path_coarse_time_dir):
            ufm_letter, ufm_number, ufm_label = parse_ufm_name(stream_id)
            full_path_ufm_dir = os.path.join(full_path_coarse_time_dir, stream_id)
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
                scan_timestamp = time()
                last_modified_max, data_files_by_type = get_results_files(parent_dir=full_path_action_dir)
                if last_modified_min is not None:
                    if last_modified_max < last_modified_min:
                        # this data is too old and is not desired
                        continue
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
                    ufm_label=ufm_label,
                    stream_id=stream_id,
                    platform=platform,
                    scan_timestamp=scan_timestamp,
                    outputs=data_files_by_type['outputs'],
                    plots=data_files_by_type['plots'],
                )


def dispatch_scrapper(timestamp_min: int, timestamp_max: int,
                      platform_dir: str, verbose: bool = False,
                      generator_mode: bool = True, last_modified_min: Optional[Union[int, float, None]] = None
                      ) -> Dict[str, Iterable[SmurfDataLocation]]:
    platform_name = os.path.basename(platform_dir)
    data_generators = {}
    for possible_dir in os.listdir(platform_dir):
        # only parse directories that are in the data_scraper_functions dictionary
        data_type = possible_dir.lower()
        full_dir_path = os.path.join(platform_dir, possible_dir)
        if os.path.isdir(full_dir_path) and data_type in data_scraper_functions.keys():
            if generator_mode:
                data_generators[data_type] = data_scraper_functions[data_type](timestamp_min, timestamp_max,
                                                                               full_dir_path,
                                                                               platform=platform_name,
                                                                               last_modified_min=last_modified_min,
                                                                               verbose=verbose)
            else:
                data_generators[data_type] = list(data_scraper_functions[data_type](timestamp_min, timestamp_max,
                                                                                    full_dir_path,
                                                                                    platform=platform_name,
                                                                                    last_modified_min=last_modified_min,
                                                                                    verbose=verbose))
    return data_generators


def find_all_data(verbose: bool = False, generator_mode: bool = True,
                  last_modified_min: Optional[Union[int, float, None]] = None,
                  timestamp_min: Optional[int] = None, timestamp_max: Optional[int] = None,
                  ) -> Dict[str, Iterable[SmurfDataLocation]]:
    if timestamp_min is None:
        timestamp_min = 0
    if timestamp_max is None:
        timestamp_max = int(time()) + 1
    data_generators_by_type = {}
    for platform_name in os.listdir(PLATFORMS_DATA_DIR):
        full_path_platform_dir = os.path.join(PLATFORMS_DATA_DIR, platform_name)
        if not os.path.isdir(full_path_platform_dir):
            continue
        if verbose:
            print(f"Collecting data generators for Platform: {platform_name}")
        data_generators_this_platform = dispatch_scrapper(timestamp_min=timestamp_min, timestamp_max=timestamp_max,
                                                          platform_dir=full_path_platform_dir, verbose=verbose,
                                                          generator_mode=generator_mode,
                                                          last_modified_min=last_modified_min)
        for data_type, single_data_gen in data_generators_this_platform.items():
            if data_type in data_generators_by_type.keys():
                data_generators_by_type[data_type].append(single_data_gen)
            else:
                data_generators_by_type[data_type] = [single_data_gen]
    data_locations_by_type = {}
    for data_type in data_generators_by_type.keys():
        data_locations_by_type[data_type] = chain(*data_generators_by_type[data_type])
    return data_locations_by_type


if __name__ == '__main__':
    data_locations_all_test = find_all_data(verbose=True, generator_mode=True)
