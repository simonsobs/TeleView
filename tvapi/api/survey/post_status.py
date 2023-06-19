import time
from warnings import warn
from typing import Optional, Union

import requests
import numpy as np


allowed_status_types = {'scan_smurf', 'test'}


def post_status(status_type: str, is_complete: bool = False, percent_complete: Optional[float] = None,
                verbose: bool = False):
    if percent_complete is None:
        if is_complete:
            percent_complete = 100.0
        else:
            percent_complete = 0.0
    else:
        percent_complete = np.round(percent_complete, 2)
    if status_type not in allowed_status_types:
        raise ValueError(f'invalid status_type ({status_type}), allowed types: {allowed_status_types}')
    status_uri = f'http://localhost:8000/api/post_status/{status_type}={percent_complete}'
    print("requests uri: ", status_uri)
    x = requests.get(status_uri)
    print("requests complete")
    if verbose:
        if x.status_code == 200:
            print(x.text)
        else:
            warn(f'failed to post status, status_code: {x.status_code}, reason: {x.reason}')


# if __name__ == '__main__':
def post_status_test(status_type: str = 'test', total_time: Union[int, float] = 30, steps: int = 11):
    if status_type not in allowed_status_types:
        raise ValueError(f'invalid status_type ({status_type}), allowed types: {allowed_status_types}')
    step_time = float(total_time) / float(steps)
    percent_step = 100.0 / float((steps - 1))
    for i in range(steps):
        start_time = time.time()
        post_status(status_type,  percent_complete=percent_step * i, verbose=True)
        now_time = time.time()
        sleep_time = step_time - (now_time - start_time)
        if sleep_time > 0.0:
            time.sleep(sleep_time)


if __name__ == '__main__':
    post_status('test', percent_complete=0.0, verbose=True)
    # post_status_test(steps=50)
