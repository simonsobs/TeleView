#!/bin/bash

REPO_PREFIX="ghcr.io/simonsobs/teleview"

VERSION_STRING=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' ./tvapp/package.json)
echo "Tagging image with tag: $VERSION_STRING"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:v"$VERSION_STRING"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:v"$VERSION_STRING"

SHA=$(git rev-parse HEAD)
echo "Tagging image with tag: $SHA"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$SHA"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$SHA"

SHORT_SHA=$(git rev-parse --short=8 HEAD)
echo "Tagging image with tag: $SHORT_SHA"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$SHORT_SHA"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$SHORT_SHA"

COMPOUND_TAG="v$VERSION_STRING-$SHORT_SHA"
echo "Tagging image with tag: $COMPOUND_TAG"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$COMPOUND_TAG"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$COMPOUND_TAG"
