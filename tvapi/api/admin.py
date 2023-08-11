from django.contrib import admin

from .models import StatusModel, SchedulerState, SchedulerQueue

admin.site.register(StatusModel)
admin.site.register(SchedulerState)
admin.site.register(SchedulerQueue)
