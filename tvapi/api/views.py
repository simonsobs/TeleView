import threading

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.generic import TemplateView

from .models import StatusModel
from tvapi.settings import DEBUG
from .survey.database import do_full_reset
from .scheduler.event_loop import increment_event_loop, threaded_one_minute_loop
from .survey.post_status import allowed_status_types, post_status_test, full_reset_types
from .scheduler.status import set_schedule_var, add_to_queue, get_query_with_timestamps, get_schedule_vars, delete_queue


class HomeView(TemplateView):
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        context['queue'] = get_query_with_timestamps()
        schedule_vars = get_schedule_vars()
        context['running'] = schedule_vars['running']
        context['DEBUG'] = DEBUG
        return self.render_to_response(context)


def get_status(request):
    data = list(StatusModel.objects.values())
    return JsonResponse(data, safe=False)


def test_status(request):
    thread = threading.Thread(target=post_status_test, args=('test', 30, 20))
    thread.start()
    return JsonResponse({'message': 'started test sequence'}, status=200)


def full_reset_view(request):
    post_type = 'full_reset'
    percent_complete = 0.0
    is_ready = True
    for single_status in list(StatusModel.objects.values()):
        # check if any of the statuses are in progress
        if single_status['percent_complete'] < 100.0:
            is_ready = False
            percent_complete = single_status['percent_complete']
            break
    if is_ready:
        # post the parsed status to the database
        for status_type in sorted(full_reset_types):
            StatusModel.objects.update_or_create(status_type=status_type, defaults={
                'percent_complete': percent_complete,
                'is_complete': False
            })
        request_string = request.path.split(f'teleview/api/{post_type}/', 1)[1].lower()
        thread = threading.Thread(target=do_full_reset, args=(None, None))
        thread.start()
        return redirect('/teleview/api/')
    else:
        return JsonResponse({'message': f'Cannot restart, {post_type} in progress and is {percent_complete}% complete.'}, status=400)


def post_status_view(request):
    request_string = request.path.split('/api/post_status/', 1)[1].lower()
    try:
        status_type, percent_complete = request_string.split('=', 1)
    except ValueError as e:
        return JsonResponse({'message': "incorrect format, wanted 'status_type=percent_complete'", 'error': str(e)},
                            status=400)
    print('status_type, percent_complete: ', status_type, percent_complete)
    if status_type not in allowed_status_types:
        return JsonResponse({'message': f'invalid status_type ({status_type}), allowed types: {allowed_status_types}'},
                            status=400)
    try:
        percent_complete = float(percent_complete)
    except ValueError as e:
        return JsonResponse({'message': f'invalid percent_complete ({percent_complete}), must be a float'},
                            status=400)
    if percent_complete < 0.0 or percent_complete > 100.0:
        return JsonResponse({'message': f'invalid percent_complete ({percent_complete}), must be between 0.0 and 100.0'},
                            status=400)
    # this is the definition of completeness
    is_complete = percent_complete == float(100.0)
    # post the parsed status to the database
    StatusModel.objects.update_or_create(status_type=status_type, defaults={'percent_complete': percent_complete,
                                                                            'is_complete': is_complete})
    return JsonResponse({'message': f'successfully posted status_type={status_type}, percent_complete={percent_complete}'})


def set_running_as_ready(request):
    return set_schedule_var(var_name='running', status="ready", task='user_override')


def set_running_off_view(request):
    return set_schedule_var(var_name='running', status="off", task='user_override')


def delete_queue_view(request):
    return delete_queue()


def queue_full_reset_view(request):
    return add_to_queue(task='full_reset')


def queue_test_view(request):
    return add_to_queue(task='test')


def increment_event_loop_view(request):
    increment_event_loop()
    return redirect('/teleview/api/')


def run_event_loop_one_minute_view(request):
    threaded_one_minute_loop()
    return redirect('/teleview/api/')
