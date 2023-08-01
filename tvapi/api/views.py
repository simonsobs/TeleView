import threading

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.generic import TemplateView

from .models import StatusModel
from .survey.database import do_scan_smurf
from .survey.post_status import allowed_status_types, post_status_test


class HomeView(TemplateView):
    template_name = 'index.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)


def get_status(request):
    data = list(StatusModel.objects.values())
    return JsonResponse(data, safe=False)


def test_status(request):
    thread = threading.Thread(target=post_status_test, args=('test', 30, 20))
    thread.start()
    return JsonResponse({'message': 'started test sequence'}, status=200)


def scan_smurf_view(request):
    post_type = 'scan_smurf'
    percent_complete = 0.0
    is_ready = True
    for single_status in list(StatusModel.objects.values()):
        if single_status['status_type'] == post_type and single_status['percent_complete'] < 100.0:
            is_ready = False
            percent_complete = single_status['percent_complete']
            break
    if is_ready:
        # post the parsed status to the database
        StatusModel.objects.update_or_create(status_type=post_type, defaults={'percent_complete': percent_complete,
                                                                              'is_complete': False})
        request_string = request.path.split('teleview/api/scan_smurf/', 1)[1].lower()
        thread = threading.Thread(target=do_scan_smurf, args=(None, None))
        thread.start()
        return redirect('/teleview/api/')
    else:
        return JsonResponse({'message': f'Cannot restart, scan_smurf in progress and is {percent_complete}% complete.'}, status=400)


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
