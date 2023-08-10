from datetime import datetime
from operator import itemgetter
from typing import Set, Dict, Union

from django.shortcuts import redirect

from api.models import SchedulerState, SchedulerQueue
from api.survey.post_status import allowed_task_operators, allowed_task_types


allowed_schedule_var = {'running'}
allowed_running_statuses = {'off', 'in_progress', 'ready', 'complete', 'failed'}
queue_advances_statues = {'ready', 'complete'}


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
        schedule_vars = get_schedule_vars()
    return schedule_vars


def get_queue() -> Set[str]:
    return set(SchedulerQueue.objects.values_list('task', flat=True))


def get_query_with_timestamps() -> Dict[str, str]:
    data_dict = {}
    for event in SchedulerQueue.objects.all():
        data_dict[event.task] = teleview_iso_time(event.timestamp)
    return data_dict


def add_to_queue(task: str = 'test'):
    task = task.lower().strip()
    if task not in allowed_task_types:
        raise ValueError(f'invalid task ({task}), allowed types: {allowed_task_types}')
    all_tasks = get_queue()
    if task not in all_tasks:
        SchedulerQueue.objects.create(task=task)
    return redirect('/teleview/api/')


def increment_queue() -> Union[str, None]:
    task = None
    task_dicts = []
    for event in SchedulerQueue.objects.all():
        task_dicts.append({'task': event.task,
                           'timestamp': event.timestamp})

    if len(task_dicts) > 0:
        sorted_tasks = sorted(task_dicts, key=itemgetter('timestamp'), reverse=True)
        task = sorted_tasks.pop()['task']
        # update the database
        SchedulerQueue.objects.filter(task=task).delete()
        set_schedule_var(var_name='running', status='in_progress', task=task)
    return task


def delete_queue():
    SchedulerQueue.objects.all().delete()
    return redirect('/teleview/api/')

