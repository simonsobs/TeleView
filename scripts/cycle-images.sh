# pull the latest version of the images
docker compose pull
# take the currently running continues offline, delete named volumes
docker compose down -v
# start the new containers from the pulled images
docker compose up -d