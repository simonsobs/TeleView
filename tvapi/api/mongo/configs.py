import os

from tvapi.settings import teleview_dir


USE_RELATIVE_PATH = True
EXPECTED_OUTPUT_DIR_NAMES = {'outputs', 'plots'}

VERBOSE = bool(os.environ.get('TELEVIEW_VERBOSE', default=False))

MONGODB_HOST = os.environ.get('TELEVIEW_MONGODB_HOST', default='localhost')
MONGODB_PORT = int(os.environ.get('TELEVIEW_MONGODB_PORT', default=27017))
MONGODB_ROOT_USERNAME = os.environ.get('TELEVIEW_MONGODB_ROOT_USERNAME', default='user')
MONGODB_ROOT_PASSWORD = os.environ.get('TELEVIEW_MONGODB_ROOT_PASSWORD', default='pass')
CONNECTION_STRING_DEFAULT = f'mongodb://{MONGODB_ROOT_USERNAME}:{MONGODB_ROOT_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/?authMechanism=DEFAULT'

test_data_location_for_default = os.path.join(teleview_dir, 'test_data', 'smurf')
# get the data locations from the environment variable TELEVIEW_LEVEL3_DATA_DIRECTORIES
SMURF_DATA_DIR = os.environ.get('TELEVIEW_SMURF_DATA_DIR', test_data_location_for_default)

EXTRA_TIME_SECONDS_FOR_COURSE_TIME = 60 * 60 * 12  # 12 hours
SEND_PROCESS_STATUS = True

REPORTS_STATUS_TIMEOUT_SECONDS = 7  # 7 seconds
REPORTS_STATUS_MINIMUM_WAIT_SECONDS = 5  # 5seconds
