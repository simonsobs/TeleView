#!/bin/bash
clear
read -r -p "TeleView Build and Upload Script for Docker images. Press any key to continue..."
# test the build on a local machine
docker compose build
# stop here to look for error messages
echo " "
echo "Build completed, press any key to launch the test-website"
read -r -p "(exit and continue by using a single Ctrl+C)..."
docker compose up
docker compose down
echo " "
echo -e "Test Website closed,"
read -r -p "Press any key to TAG the images with version number and Git SHA..."
./scripts/tag-images.sh
echo -e "Tags written,"
read -r -p "Press any key to PUSH the new images to the container repository and continue..."
./scripts/ghcr-login.sh
./scripts/push-images.sh
read -r -p  "Build script completed."
