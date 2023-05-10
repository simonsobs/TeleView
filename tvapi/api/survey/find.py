import os
from typing import List, Dict, Tuple, NamedTuple, Optional, Union

from tvapi.settings import BASE_DIR


expected_results_dir_names = {'outputs', 'plots'}

all_found_acquisition_types = set()


def get_time_dirs(parent_dir: str) -> List[int]:
    return [int(time_dir) for time_dir in os.listdir(parent_dir) if time_dir.isdigit()]


def get_ufm_dirs(parent_dir: str) -> List[str]:
    return [time_dir for time_dir in os.listdir(parent_dir) if time_dir.lower().startswith('ufm')]


def parse_ufm_name(ufm_dir: str) -> Tuple[str, int]:
    ufm_dir = ufm_dir.lower().strip()
    _, dir_info = ufm_dir.split('_')
    ufm_letter, ufm_number_str = dir_info.split('v')
    return ufm_letter, int(ufm_number_str)


def parse_acquisition_name(acquisition_dir: str) -> Tuple[Union[int, None], str]:
    time_stamp_str, acquisition_type = acquisition_dir.split('_', 1)
    if time_stamp_str.lower().strip() == 'none':
        time_stamp = None
    else:
        time_stamp = int(time_stamp_str)
    return time_stamp, acquisition_type


def get_results_files(parent_dir: str) -> Dict[str, List[str]]:
    # the only expected dir inside the acquisition dir is 'outputs'
    found_dirs = set()
    data_files_by_type = {}
    for output_dir in os.listdir(parent_dir):
        if output_dir not in expected_results_dir_names:
            raise ValueError(f"Unexpected dir name {output_dir} inside {parent_dir}")
        found_dirs.add(output_dir)
        full_path_output_dir = os.path.join(parent_dir, output_dir)
        data_files_by_type[output_dir] = os.listdir(full_path_output_dir)
    for not_found_dir in expected_results_dir_names - found_dirs:
        data_files_by_type[not_found_dir] = None
    return data_files_by_type


class SmurfDataLocation(NamedTuple):
    time_stamp_course: int
    time_stamp: Union[int, None]
    ufm_letter: str
    ufm_number: int
    acquisition_type: str
    full_path: str
    outputs: Optional[List[str]] = None
    plots: Optional[List[str]] = None


data_scraper_functions = {}


def data_scraper(func):
    name_type = func.__name__
    data_scraper_functions[name_type] = func
    return func


@data_scraper
def smurf(smurf_data_path: str, verbose: bool = False):
    if verbose:
        print(f"  Scrapping smurf data from {smurf_data_path}")
    for course_time_int in get_time_dirs(parent_dir=smurf_data_path):
        full_path_course_time_dir = os.path.join(smurf_data_path, str(course_time_int))
        for ufm_dir in get_ufm_dirs(parent_dir=full_path_course_time_dir):
            ufm_letter, ufm_number = parse_ufm_name(ufm_dir)
            full_path_ufm_dir = os.path.join(full_path_course_time_dir, ufm_dir)
            for acquisition_dir in os.listdir(full_path_ufm_dir):
                full_path_acquisition_dir = os.path.join(full_path_ufm_dir, acquisition_dir)
                time_stamp_int, acquisition_type = parse_acquisition_name(acquisition_dir)
                data_files_by_type = get_results_files(parent_dir=full_path_acquisition_dir)
                all_found_acquisition_types.add(acquisition_type)
                yield SmurfDataLocation(
                    time_stamp_course=course_time_int,
                    time_stamp=time_stamp_int,
                    ufm_letter=ufm_letter,
                    ufm_number=ufm_number,
                    acquisition_type=acquisition_type,
                    full_path=full_path_acquisition_dir,
                    outputs=data_files_by_type['outputs'],
                    plots=data_files_by_type['plots'],
                )


def get_level3_data_dirs(verbose:  bool = False) -> List[str]:
    # This is what is used if the environment variable TELEVIEW_LEVEL3_DATA_DIRECTORIES is not set.
    teleview_dir = os.path.dirname(BASE_DIR)
    test_data_location_for_default = os.path.join(teleview_dir, 'test_data')
    # get the data locations from the environment variable TELEVIEW_LEVEL3_DATA_DIRECTORIES
    level3_data_dirs_str = os.environ.get('TELEVIEW_LEVEL3_DATA_DIRECTORIES', test_data_location_for_default)
    level3_data_dirs = [raw_path.strip() for raw_path in level3_data_dirs_str.split(';')]
    if verbose:
        print("Level3_data_dirs:")
        for i, level3_data_dir in list(enumerate(level3_data_dirs)):
            print(f"{1 + i: 3}.) {level3_data_dir}")
    return level3_data_dirs


def find_data(level3_data_dir: str, verbose: bool = False) -> Dict[str, List[str]]:
    data_locations_single_dir = {}
    for possible_dir in os.listdir(level3_data_dir):
        # only parse directories that are in the data_scraper_functions dictionary
        dir_str = possible_dir.lower()
        full_dir_path = os.path.join(level3_data_dir, possible_dir)
        if os.path.isdir(full_dir_path) and dir_str in data_scraper_functions.keys():
            # data_locations_this_dir = data_scraper_functions[dir_str](full_dir_path, verbose=verbose)
            data_locations_this_dir = list(data_scraper_functions[dir_str](full_dir_path, verbose=verbose))
            if dir_str in data_locations_single_dir.keys():
                data_locations_single_dir[dir_str].extend(data_locations_this_dir)
            else:
                data_locations_single_dir[dir_str] = data_locations_this_dir
    return data_locations_single_dir


def find_all_data(verbose: bool = False) -> Dict[str, List[str]]:
    data_locations_all = {}
    for level3_data_dir in get_level3_data_dirs(verbose=verbose):
        data_locations_single_dir = find_data(level3_data_dir=level3_data_dir, verbose=verbose)
        for dir_str, data_locations_this_dir in data_locations_single_dir.items():
            if dir_str in data_locations_all.keys():
                data_locations_all[dir_str].extend(data_locations_this_dir)
            else:
                data_locations_all[dir_str] = data_locations_this_dir
    return data_locations_all


if __name__ == '__main__':
    data_locations_all_test = find_all_data(verbose=True)
