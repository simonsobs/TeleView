from django.urls import path

from . import views

urlpatterns = [
    path('status', views.StatusView.as_view(), name='status'),
    path('get_status', views.get_status, name='get_status-view'),
    path('', views.HomeView.as_view(), name='index'),
]


