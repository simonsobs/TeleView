# # Things that can be cached
# Base Configurations
FROM python as build
ENV PYTHONNUNBUFFERED 1
WORKDIR /django
# set up the cronlog
RUN mkdir /cronlogs
RUN touch /cronlogs/cron.log
# set the permissions intialistation script for the container
ADD start.sh /
RUN ["chmod", "+x", "/start.sh"]
# update pip
RUN pip install --upgrade pip
# get the cron application installed
RUN apt update
RUN apt-get install cron -y
# pip install the requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# # Things that will need to update every time the code changes
# copy all the files into the container
COPY . .
# this will also install the SpExoDisks, the data science package.
# Perpare the local Django database.
RUN python manage.py makemigrations
# Initalise the database
RUN python manage.py migrate --noinput
# make a superuser the Django database when all these aguments are passed in
ARG DJANGO_SUPERUSER_USERNAME=$DJANGO_SUPERUSER_USERNAME
ARG DJANGO_SUPERUSER_PASSWORD=$DJANGO_SUPERUSER_PASSWORD
ARG DJANGO_SUPERUSER_EMAIL=$DJANGO_SUPERUSER_EMAIL
RUN python manage.py createsuperuser --noinput
# collect the static files
RUN python manage.py collectstatic --clear --noinput
# add the cron jobs to the Django management, but only after the data is upload to mysql
RUN python manage.py crontab add
# what runs when the container is started
CMD ["/start.sh"]
# CMD ["gunicorn", "tvapi.wsgi", "--bind", "0.0.0.0:8000"]