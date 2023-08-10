import time
import threading

from api.survey.database import do_full_reset
from tvapi.settings import SCHEDULER_SLEEP_TIME_SECONDS
from api.scheduler.status import get_schedule_vars, set_schedule_var, increment_queue

event_task_functions = {}


def event_task(func):
    task_name = func.__name__

    def threaded_func():
        thread = threading.Thread(target=func)
        thread.start()
    event_task_functions[task_name] = threaded_func
    return threaded_func


@event_task
def test(sleep_time: int = 10):
    print(f'running test task, sleeping for {sleep_time} seconds.')
    time.sleep(sleep_time)
    print('test task complete.')
    set_schedule_var(var_name='running', status='complete', task='test')
    set_schedule_var(var_name='scheduler', status='ready', task='test')


@event_task
def full_reset():
    print('Doing a full database reset.')
    do_full_reset()
    print('Full database reset complete.')
    set_schedule_var(var_name='running', status='complete', task='full_reset')
    set_schedule_var(var_name='scheduler', status='ready', task='full_reset')


def increment_event_loop():
    """The scheduler main event loop for TeleView database jobs.

    The loop will run at a set interval. States are controlled and set using
    the database connected to Django Application"""

    schedule_vars = get_schedule_vars()
    schedule_status = schedule_vars['scheduler']['status']
    running_status = schedule_vars['running']['status']
    if schedule_status != 'off' and running_status != 'in_progress':
        task = increment_queue()
        if task is not None:
            event_task_functions[task]()


def run_event_loop(sleep_interval_seconds: float = 1.0, total_runtime_seconds: float = 60.0):
    sleep_interval_seconds = float(sleep_interval_seconds)
    stop_time = time.time() + total_runtime_seconds - sleep_interval_seconds
    now = time.time()
    while now < stop_time:
        increment_event_loop()
        time.sleep(sleep_interval_seconds)
        now = time.time()


def threaded_one_minute_loop():
    def cron_one_minute_loop():
        run_event_loop(sleep_interval_seconds=SCHEDULER_SLEEP_TIME_SECONDS, total_runtime_seconds=60.0)
    thread = threading.Thread(target=cron_one_minute_loop)
    thread.start()
