#!/bin/bash
service cron start
gunicorn tvapi.wsgi --bind 0.0.0.0:8000