"""
Django settings for tvapi project.

Generated by 'django-admin startproject' using Django 4.2.1.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
from pathlib import Path
from warnings import warn


def get_bool_env(name: str, default: bool = False):
    """Get a boolean environment variable."""
    value = os.environ.get(name, default)
    if value in {'', '0', 'false', 'f', 'n', 'no'}:
        return False
    else:
        return bool(value)


# triggers print statements that are useful for debugging
VERBOSE = get_bool_env('TELEVIEW_VERBOSE', default=True)


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# the locations of data directories
# This is what is used if the environment variable TELEVIEW_LEVEL3_DATA_DIRECTORIES is not set.
teleview_dir = os.path.dirname(BASE_DIR)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-#j1oh9q%^3qtop8mi1#z6^xfh!ue#=w3xoxfoqbbjlw=r%@l+o'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = get_bool_env('TELEVIEW_DEBUG', default=True)
if DEBUG:
    warn("DEBUG is True")

TELEVIEW_PUBLIC_SITE_HOST = os.environ.get('TELEVIEW_PUBLIC_SITE_HOST', default='*')
stripped_host_name = str(TELEVIEW_PUBLIC_SITE_HOST)
if "//" in stripped_host_name:
    # strip off the protocol (https:// or http://)
    stripped_host_name = stripped_host_name.split("//", 1)[1]
if "/" in stripped_host_name:
    # strip off the path
    stripped_host_name = stripped_host_name.split("/", 1)[0]
if ":" in stripped_host_name:
    # strip off the port number
    stripped_host_name = stripped_host_name.rsplit(":", 1)[0]
if DEBUG:
    warn(f"auto-configured hostname is: {stripped_host_name}")
ALLOWED_HOSTS = list({
    'localhost',
    '127.0.0.1',
    stripped_host_name,
})
if stripped_host_name == "localhost":
    CSRF_TRUSTED_ORIGINS = [f"http://{stripped_host_name}"]
else:
    CSRF_TRUSTED_ORIGINS = [f"https://{stripped_host_name}"]

# Application definition

INSTALLED_APPS = [
    'api',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_crontab'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tvapi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [str(os.path.join(BASE_DIR, 'api', 'templates'))],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tvapi.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'teleview/api/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static_root')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'static_bootstrap'),
]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# When set to True, if the request URL does not match any of the patterns in the URLconf, it will
# try appending a slash to the request path and try again. If it finds a match, the function will
APPEND_SLASH = True

# # CRON JOB
# the scheduler event loop is set to run every 3 seconds
SCHEDULER_SLEEP_TIME_SECONDS = 3.0

CRONJOBS = [
    # call a one-minute loop every minute
    ('* * * * *', 'api.cron.request_run_event_loop_one_minute'),
    # same as above, but adds print-statements, warning, and errors to a log file
    # ('* * * * *', 'api.cron.request_run_event_loop_one_minute', f'>> {BASE_DIR}/logs/cron_one_minute_loop.log 2>&1'),
    # every-day at 07:03 UTC operation to fully update the database from the recent time period.
    ('3 7 * * *', 'api.cron.request_queue_update_recent'),
    # every 5th minute operation to update the database from the modification time
    ('*/5 * * * *', 'api.cron.request_queue_update_from_modification_time'),
]


# Custom Settings, not for Django but for the teleview api
USE_RELATIVE_PATH = True
EXPECTED_OUTPUT_DIR_NAMES = {'outputs', 'plots'}

MONGODB_HOST = os.environ.get('TELEVIEW_MONGODB_HOST', default='localhost')
MONGODB_PORT = int(os.environ.get('TELEVIEW_MONGODB_PORT', default=27017))
MONGODB_ROOT_USERNAME = os.environ.get('TELEVIEW_MONGODB_ROOT_USERNAME', default='user')
MONGODB_ROOT_PASSWORD = os.environ.get('TELEVIEW_MONGODB_ROOT_PASSWORD', default='pass')
CONNECTION_STRING_DEFAULT = f'mongodb://{MONGODB_ROOT_USERNAME}:{MONGODB_ROOT_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/?authMechanism=DEFAULT'

test_data_location_for_default = os.path.join(teleview_dir, 'test_data')
# get the data locations from the environment variable PLATFORMS_DATA_DIR
PLATFORMS_DATA_DIR = os.environ.get('PLATFORMS_DATA_DIR', test_data_location_for_default)

EXTRA_TIME_SECONDS_FOR_COARSE_TIME = 60 * 60 * 12  # 12 hours
SEND_PROCESS_STATUS = True

REPORTS_STATUS_TIMEOUT_SECONDS = 7  # 7 seconds
REPORTS_STATUS_MINIMUM_WAIT_SECONDS = 5  # 5 seconds