import time
from datetime import datetime
from operator import itemgetter
from typing import Set, Dict, Union

from django.shortcuts import redirect

from api.models import SchedulerState, SchedulerQueue, StatusModel
from api.survey.post_status import allowed_task_operators, allowed_task_types

allowed_schedule_var = {'running'}
allowed_running_statuses = {'off', 'locked', 'in_progress', 'ready', 'complete', 'failed'}
queue_advances_statues = {'ready', 'complete', 'failed'}


def teleview_iso_time(datetime_obj: datetime) -> str:
    return datetime_obj.isoformat().replace('T', ' ').rsplit('.', 1)[0] + ' UTC'


def set_schedule_var(var_name: str = 'schedule', status: str = 'off', task: str = 'user_override'):
    var_name = var_name.lower().strip()
    if var_name == 'running':
        if status not in allowed_running_statuses:
            raise ValueError(f'invalid status ({status}), allowed types: {allowed_running_statuses}')
    else:
        raise ValueError(f'invalid var_name ({var_name}), allowed types: {allowed_schedule_var}')
    if task not in allowed_task_operators:
        raise ValueError(f'invalid task_name ({task}), allowed types: {allowed_task_operators}')
    SchedulerState.objects.update_or_create(var_name=var_name, defaults={'status': status, 'task': task})
    return redirect('/teleview/api/')


def get_schedule_vars() -> Dict[str, any]:
    schedule_vars = {}
    for event in SchedulerState.objects.all():
        schedule_vars[event.var_name] = {'var_name': event.var_name.capitalize(),
                                         'status': event.status,
                                         'task': event.task,
                                         'timestamp': teleview_iso_time(event.timestamp)}
    if 'running' not in schedule_vars:
        SchedulerState.objects.update_or_create(var_name='running', defaults={'status': 'ready', 'task': 'init'})
        time.sleep(1)
        schedule_vars = get_schedule_vars()
    return schedule_vars


def get_queue() -> Set[str]:
    tasks_set = set(SchedulerQueue.objects.values_list('task', flat=True))
    return tasks_set


def get_query_with_timestamps() -> Dict[str, str]:
    is_empty = True
    tasks_list = []
    for event in SchedulerQueue.objects.all():
        tasks_list.append((event.task, event.timestamp, teleview_iso_time(event.timestamp)))
        is_empty = False
    tasks_list_sorted = sorted(tasks_list, key=itemgetter(1))
    data_dict = {task: iso_string for (task, timestamp, iso_string) in tasks_list_sorted}
    return data_dict


def add_to_queue(task: str = 'test'):
    task = task.lower().strip()
    if task not in allowed_task_types:
        raise ValueError(f'invalid task ({task}), allowed types: {allowed_task_types}')
    all_tasks = get_queue()
    if task not in all_tasks:
        StatusModel.objects.update_or_create(status_type='queue',
                                             defaults={'percent_complete': 0.0,
                                                       'is_complete': False})
        SchedulerQueue.objects.create(task=task)
    return redirect('/teleview/api/')


def increment_queue() -> Union[str, None]:
    set_schedule_var(var_name='running', status='locked', task='queue')
    task = None
    task_dicts = []
    for event in SchedulerQueue.objects.all():
        task_dicts.append({'task': event.task,
                           'timestamp': event.timestamp})

    if len(task_dicts) > 0:
        sorted_tasks = sorted(task_dicts, key=itemgetter('timestamp'), reverse=True)
        task = sorted_tasks.pop()['task']
        if len(sorted_tasks) == 0:
            # This is the case where the popped task was the last one in the queue
            StatusModel.objects.update_or_create(status_type='queue',
                                                 defaults={'percent_complete': 100.0,
                                                           'is_complete': True})
        # update the database
        SchedulerQueue.objects.filter(task=task).delete()
    else:
        set_schedule_var(var_name='running', status='ready', task='queue')
    return task


def delete_queue():
    SchedulerQueue.objects.all().delete()
    StatusModel.objects.update_or_create(status_type='queue',
                                         defaults={'percent_complete': 100.0,
                                                   'is_complete': True})
    return redirect('/teleview/api/')

