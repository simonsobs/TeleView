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

# # Things that will need to update every time the code changes
# copy all the files into the container
COPY . .
# this will also install the SpExoDisks, the data science package.
RUN pip install -r requirements.txt
# Perpare the local Django database.
RUN python manage.py makemigrations
# Initalise the database
RUN python manage.py migrate
# put all the static files in the right place
RUN python manage.py collectstatic --noinput
# add the cron jobs to the Django management, but only after the data is upload to mysql
RUN python manage.py crontab add
# what runs when the container is started
CMD ["/start.sh"]
# CMD ["gunicorn", "tvapi.wsgi", "--bind", "0.0.0.0:8000"]