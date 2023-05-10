import os
from pymongo import MongoClient


connection_string = os.environ.get('MONGO_CONNECTION_STRING')
client = MongoClient('connection_string')
db = client['db_name']
