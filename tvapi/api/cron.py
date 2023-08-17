"""
The Cron jogs defined in theis files do not use the same environment as the rest of the Django app.
As such, the environment variables must be set in the crontab file.

In this file, we skip all that and just run the functions by making an http request to the Django app.
One view per-cran job, and the only job of that view is to run the cron-stimulated function.
"""
import requests


base_url = 'http://localhost:8000/teleview/api/'


def make_request(request_string):
    url = base_url + request_string
    response = requests.get(url)
    print('response: ', response)
    print('response.text: ', response.text)
    print('response.status_code: ', response.status_code)


def request_run_event_loop_one_minute():
    make_request('run_event_loop_one_minute/')


def request_queue_update_recent():
    make_request('queue_update_recent/')


def request_queue_update_from_modification_time():
    make_request('queue_update_from_modification_time/')
