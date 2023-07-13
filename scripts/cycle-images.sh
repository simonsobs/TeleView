# pull the latest version of the images
docker compose pull
# take the currently running continues offline
docker compose down
# start the new containers from the pulled images
docker compose up -d