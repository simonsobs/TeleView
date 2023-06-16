from django.urls import path, re_path

from . import views

urlpatterns = [
    path('test_status', views.test_status, name='test-status-view'),
    path('get_status', views.get_status, name='get_status-view'),
    re_path(r'^post_status/.*$', views.post_status_view, name='post-status-view'),
    re_path(r'^smurf_scan/.*$', views.smurf_scan_view, name='smurf-scan-view'),
    path('', views.HomeView.as_view(), name='index'),
]


