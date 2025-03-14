import time
import threading
import traceback

from django.db import OperationalError
from django.db.models import F

from api.models import StatusModel
from tvapi.settings import SCHEDULER_SLEEP_TIME_SECONDS
from api.survey.database import do_full_reset, do_update, do_update_recent, do_update_from_modification_time
from api.scheduler.status import get_schedule_vars, set_schedule_var, \
    add_to_queue, increment_queue, queue_advances_statues


event_task_functions = {}


def event_task(func):
    task_name = func.__name__

    # wrap the function error handling and database status setting
    def func_start_exit():
        print(f'Starting {task_name} task.')
        set_schedule_var(var_name='running', status='in_progress', task=task_name)
        try:
            func()
        except Exception as e:
            print(f'Exception in {task_name} task: {e}\n{traceback.format_exc()}')
            set_schedule_var(var_name='running', status='failed', task=task_name)
            add_to_queue(task=task_name)
            StatusModel.objects.filter(status_type=task_name).update(retry_count=F('retry_count') + 1,
                                                                     percent_complete=0.0,
                                                                     is_complete=False)

        else:
            print(f'Exiting {task_name} task.')
            set_schedule_var(var_name='running', status='complete', task=task_name)
            StatusModel.objects.update_or_create(status_type=task_name,
                                                 defaults={'percent_complete': 100.0,
                                                           'is_complete': True})

    # wrap the function in a thread to be called by the event loop without blocking
    def func_thread():
        StatusModel.objects.update_or_create(status_type=task_name,
                                             defaults={'percent_complete': 0.0,
                                                       'is_complete': False})
        thread = threading.Thread(target=func_start_exit)
        thread.start()

    # add the function to the dictionary of functions
    event_task_functions[task_name] = func_thread
    return func_thread


@event_task
def test(sleep_time: int = 10):
    time.sleep(sleep_time)


@event_task
def full_reset():
    do_full_reset()


@event_task
def update():
    do_update()


@event_task
def update_recent():
    do_update_recent()


@event_task
def update_from_modification_time():
    do_update_from_modification_time()


def increment_event_loop():
    """The scheduler main event loop for TeleView database jobs.

    The loop will run at a set interval. States are controlled and set using
    the database connected to Django Application"""

    schedule_vars = get_schedule_vars()
    running_status = schedule_vars['running']['status']
    if running_status in queue_advances_statues:
        for tries in range(20):
            try:
                task = increment_queue()
                break
            except OperationalError:
                time.sleep(2)
        else:
            # this happens if the database is locked for too long, allow this tread to exit without doing anything
            set_schedule_var(var_name='running', status='ready', task='queue')
            task = None
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
