from django.shortcuts import render
from datetime import datetime

# Create your views here.
from django.http import HttpResponse
from api.survey.database import get_action_data


def index(request):
    return HttpResponse("Hello, world. You're at the api index.")
