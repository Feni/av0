import os

from django.contrib import messages

from .local_settings import *
import os
import raven


# # First, setup logging

# Log everything to file
import logging
import sys
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

# Google cloud logger is broken for some reason...
# # Imports the Google Cloud client library
# import google.cloud.logging

# # Instantiates a client
# client = google.cloud.logging.Client()

# # Connects the logger to the root logging handler; by default this captures
# # all logs at INFO level and higher
# client.setup_logging()




SITE_ID = 1
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# IS_PROD = os.getenv('GAE_INSTANCE', '') != ''  # App engine flexible
IS_PROD = os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = PROD_SECRET

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

# SECURITY WARNING: App Engine's security features ensure that it is safe to
# have ALLOWED_HOSTS = ['*'] when the app is deployed. If you deploy a Django
# app not on App Engine, make sure to set an appropriate host here.
# See https://docs.djangoproject.com/en/1.10/ref/settings/
# TODO
ALLOWED_HOSTS = ['*']


# SMTP isn't actually used. We use Sendgrid's rest email backend.
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = 'arevelapp'
EMAIL_HOST_PASSWORD = SENDGRID_PASS
EMAIL_PORT = 587
EMAIL_USE_TLS = True


EMAIL_BACKEND = "sendgrid_backend.SendgridBackend"

# TODO: Later on split up arevel key from the key used for sending user emails
SENDGRID_API_KEY = AREVEL_SENDGRID_KEY

# Enable emails in local dev
SENDGRID_SANDBOX_MODE_IN_DEBUG = False

DEFAULT_FROM_EMAIL = 'Arevel <arevelapp@gmail.com>'
# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.humanize',

    # json field
    'django_mysql',

    # Django all auth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    # Crispy
    'crispy_forms',

    # Arevel apps
    'arevelcore',
    'workspace',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',

    'arevelcore.middleware.IdentifierMiddleware',
    'arevelcore.middleware.LoggingMiddleware'
)

ROOT_URLCONF = 'arevel.urls'
AUTH_USER_MODEL = 'arevelcore.ArevelUser'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, "templates")
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
                'django_settings_export.settings_export',
            ],
        },
    },
]


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

MESSAGE_TAGS = {
    messages.ERROR: 'danger'
}

if DEBUG:
    STATIC_URL = os.environ.get('STATIC_URL', '/static/')   # /static/ if DEBUG else Google Cloud bucket url
else:
    STATIC_URL = 'https://storage.googleapis.com/arevel-209217.appspot.com/static/'
MEDIA_URL = 'https://storage.googleapis.com/arevel-209217.appspot.com/media/'


WSGI_APPLICATION = 'arevel.wsgi.application'

# Settings available to template
SETTINGS_EXPORT = [
    'DEBUG',
]

#django all auth
ACCOUNT_USERNAME_REQUIRED = False   # Don't bother with usernames.
ACCOUNT_EMAIL_REQUIRED = True       # Require email
ACCOUNT_SESSION_REMEMBER = True     # Always remember user

ACCOUNT_SIGNUP_EMAIL_ENTER_TWICE = False
ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE = False

ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_LOGOUT_ON_GET = True
ACCOUNT_LOGIN_ON_PASSWORD_RESET = True

ACCOUNT_AUTHENTICATION_METHOD = "email"

ACCOUNT_FORMS = {
    'signup': 'arevelcore.forms.ArevelSignupForm',
}


LOGIN_REDIRECT_URL = "/docs/latest"


# Django session age = 90 days.
SESSION_COOKIE_AGE = 7776000


# Set to stripe TEST keys. Only use live keys in production.
STRIPE_PUBLIC_KEY = "pk_test_jW68axcBPVZ3Ao6Ja1JzjxqL"
STRIPE_SECRET_KEY = "sk_test_QioJgIfrUBgvOV5kkVNGvVtm"


# Crispy forms
CRISPY_TEMPLATE_PACK = "bootstrap4"


# Dev Key
AMPLITUDE_KEY = "b9e1638dfa8bca4f6e948723fdc322ab"


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

# Check to see if MySQLdb is available; if not, have pymysql masquerade as
# MySQLdb. This is a convenience feature for developers who cannot install
# MySQLdb locally; when running in production on Google App Engine Standard
# Environment, MySQLdb will be used.
# try:
#     import MySQLdb  # noqa: F401
# except ImportError:
#     import pymysql
#     pymysql.install_as_MySQLdb()

# import MySQLdb  # noqa: F401


# Production only configurations
if IS_PROD:
    DEBUG = False
    print("is prod")
    # Running on production App Engine, so connect to Google Cloud SQL using
    # the unix socket at /cloudsql/<your-cloudsql-connection string>
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'HOST': '/cloudsql/arevel-209217:us-central1:arevelsql',
            'NAME': 'areveldb',
            'USER': 'arevelapp',
            'PASSWORD': MYSQL_PASS
        }
    }

    AMPLITUDE_KEY = LIVE_AMPLITUDE_KEY

    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #         'HOST': '/cloudsql/arevel-0:us-central1:arevelpg',
    #         'NAME': 'areveldb',
    #         'USER': 'arevelapp',
    #          'PASSWORD': PG_PASS
    #      }
    # }

    INSTALLED_APPS += ('raven.contrib.django.raven_compat',)

    RAVEN_CONFIG = {
        'dsn': 'https://cfe92cbbed2f428b99b73ccb9419dab0:b3c12a608d6349b09fae83a7868e84a7@sentry.io/296381'
    }
    # TODO: Cached template loader.

    # Warning! This should ONLY be enabled in production!
    STRIPE_PUBLIC_KEY = STRIPE_LIVE_PUBLIC_KEY
    STRIPE_SECRET_KEY = STRIPE_LIVE_SECRET_KEY


elif os.getenv('SETTINGS_MODE', '') == 'proxyprod':      # Use to connect to prod from local for migrations.
    # ./cloud_sql_proxy -instances=arevel-0:us-central1:arevel=tcp:3306
    print "Warning: PROD PROXY MODE!!!!"


    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'HOST': '127.0.0.1',
            'PORT': 3306,
            'NAME': 'areveldb',
            'USER': 'arevelapp',
            'PASSWORD': MYSQL_PASS,
            'OPTIONS': {
                'charset': 'utf8mb4',
            },
        }
    }

    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #         'HOST': '127.0.0.1',
    #         'PORT': 3306,
    #         'NAME': 'areveldb',
    #         'USER': 'arevelapp',
    #         'PASSWORD': PG_PASS
    #      }
    # }


else:
    # Development only configurations
    print("is dev")

    # Running locally so connect to either a local MySQL instance or connect to
    # Cloud SQL via the proxy. To start the proxy via command line:
    #
    #     $ cloud_sql_proxy -instances=[INSTANCE_CONNECTION_NAME]=tcp:3306
    #
    # See https://cloud.google.com/sql/docs/mysql-connect-proxy
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'HOST': '127.0.0.1',
            'PORT': 3306,
            'NAME': 'areveltest',
            'USER': 'arevelapp',
            'PASSWORD': MYSQL_PASS,
            'OPTIONS': {
                'charset': 'utf8mb4',
            },
        }
    }

# [END db_setup]

# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_ROOT = 'dist/static'
