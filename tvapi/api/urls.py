from django.urls import path, re_path

from . import views

urlpatterns = [
    path('get_running/', views.get_running_view, name='get-running-view'),
    path('get_queue/', views.get_queue_view, name='get-queue-view'),
    path('test_status/', views.test_status, name='test-status-view'),
    path('get_status/', views.get_status, name='get_status-view'),
    re_path(r'^post_status/.*$', views.post_status_view, name='post-status-view'),
    re_path(r'^full_reset/.*$', views.full_reset_view, name='full-reset-view'),
    re_path(r'^set_running_ready/.*$', views.set_running_as_ready, name='set-running-ready-view'),
    re_path(r'^set_running_off/.*$', views.set_running_off_view, name='set-running-off-view'),
    re_path(r'^queue_full_reset/.*$', views.queue_full_reset_view, name='queue-full-reset-view'),
    re_path(r'^queue_update_view/.*$', views.queue_update_view, name='queue-update-view'),
    re_path(r'^queue_update_recent/.*$', views.queue_update_recent_view, name='queue-update-recent-view'),
    re_path(r'^queue_update_from_modification_time/.*$', views.queue_update_from_modification_time_view, name='queue-update-from-modification-time-view'),
    re_path(r'^queue_test/.*$', views.queue_test_view, name='queue-test-view'),
    re_path(r'^delete_queue/.*$', views.delete_queue_view, name='delete-queue-view'),
    re_path(r'^delete_status/.*$', views.delete_status_view, name='delete-status-view'),
    re_path(r'^increment_event_loop/.*$', views.increment_event_loop_view, name='increment-event-loop-view'),
    re_path(r'^run_event_loop_one_minute/.*$', views.run_event_loop_one_minute_view, name='run-event-loop_one-minute-view'),
    path('', views.HomeView.as_view(), name='index'),
]


