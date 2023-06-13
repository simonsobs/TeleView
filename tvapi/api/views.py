from django.shortcuts import render
from datetime import datetime

# Create your views here.
from warnings import warn
from django.http import JsonResponse
from django.urls import reverse
from django.views.generic import TemplateView, ListView
from api.survey.database import get_action_data
from .models import StatusModel


class HomeView(TemplateView):
    template_name = 'index.html'


class StatusView(TemplateView):
    template_name = 'status.html'

    def get(self, request, *args, **kwargs):
        print("Status Page Print Statement, args: ", args, "kwargs: ", kwargs)
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)


def get_status(request):
    data = list(StatusModel.objects.values())
    return JsonResponse(data, safe=False)
