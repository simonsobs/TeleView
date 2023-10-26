#!/bin/bash
# screen the .env file for "carriage return"
if grep -q -r $'\r' .env; then
    echo
    echo "The .env file contains DOS carriage returns."
    echo "Try cleaning it with \"sed $'s/\r//' -i .env\""
    echo
    echo " .tvapp/.env.production not created."
    exit 1
fi

# read the environment variables from the .env file
set -o allexport
source .env
set +o allexport
# write the environment variables for the NEXT.js application (.env.production)
{
  echo -e "TELEVIEW_PUBLIC_SITE_HOST=$TELEVIEW_PUBLIC_SITE_HOST";
  echo -e "TELEVIEW_VERBOSE=$TELEVIEW_VERBOSE";
  echo -e "TELEVIEW_MONGODB_ROOT_USERNAME=\"$TELEVIEW_MONGODB_ROOT_USERNAME\"";
  echo -e "TELEVIEW_MONGODB_ROOT_PASSWORD=\"$TELEVIEW_MONGODB_ROOT_PASSWORD\"";
  echo -e "TELEVIEW_MONGODB_HOST=\"$TELEVIEW_MONGODB_HOST\"";
  echo -e "TELEVIEW_MONGODB_PORT=$TELEVIEW_MONGODB_PORT";
  echo -e "TELEVIEW_DEFAULT_ITEMS_PER_PAGE=$TELEVIEW_DEFAULT_ITEMS_PER_PAGE";
} > ./tvapp/.env.production



