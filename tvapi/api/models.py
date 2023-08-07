from django.db import models


class StatusModel(models.Model):
    status_type = models.CharField(max_length=100, primary_key=True, unique=True)
    is_complete = models.BooleanField(default=False)
    percent_complete = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        timestamp_utc = str(self.timestamp).rsplit('.', 1)[0]
        return f'{self.status_type} is {"%6.2f" % self.percent_complete}% complete at {timestamp_utc}.'
