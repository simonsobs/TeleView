from django.urls import path, re_path

from . import views

urlpatterns = [
    path('test_status', views.test_status, name='test-status-view'),
    path('get_status', views.get_status, name='get_status-view'),
    re_path(r'^post_status/.*$', views.post_status_view, name='post-status-view'),
    re_path(r'^full_reset/.*$', views.full_reset_view, name='full-reset-view'),
    re_path(r'^set_running_ready/.*$', views.set_running_as_ready, name='set-running-ready-view'),
    re_path(r'^set_scheduler_ready/.*$', views.set_scheduler_ready_view, name='set-scheduler-ready-view'),
    re_path(r'^set_scheduler_off/.*$', views.set_scheduler_off_view, name='set-scheduler-off-view'),
    re_path(r'^queue_full_reset/.*$', views.queue_full_reset_view, name='queue-full-reset-view'),
    re_path(r'^queue_test/.*$', views.queue_test_view, name='queue-test-view'),
    re_path(r'^delete_queue/.*$', views.delete_queue_view, name='delete-queue-view'),
    re_path(r'^increment_event_loop/.*$', views.increment_event_loop_view, name='increment-event-loop-view'),
    re_path(r'^run_event_loop_one_minute/.*$', views.run_event_loop_one_minute_view, name='run-event-loop_one-minute-view'),
    path('', views.HomeView.as_view(), name='index'),
]


