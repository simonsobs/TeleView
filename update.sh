#!/bin/bash
clear
echo "TeleView Web Portal Update Script"
./scripts/git-update.sh
echo "Pulling from the Github container repository"
# these actions are in scripts that may be updated after the repo refresh above
./scripts/ghcr-login.sh
./scripts/cycle-images.sh
echo "Containers cycled verify the live site in after 20 seconds of database initialization."
echo "Completed: TeleView Web Portal Update Script"
read -r -p "press any key to exit."
