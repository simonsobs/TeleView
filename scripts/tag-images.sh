#!/bin/bash

REPO_PREFIX="ghcr.io/simonsobs/teleview"


SHA=$(git rev-parse HEAD)
echo "Tagging image with tag: $SHA"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$SHA"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$SHA"

SHORT_SHA=$(git rev-parse --short=8 HEAD)
echo "Tagging image with tag: $SHORT_SHA"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$SHORT_SHA"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$SHORT_SHA"

VERSION_STRING=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' ./tvapp/package.json)
COMPOUND_TAG="v$VERSION_STRING-$SHORT_SHA"
echo "Tagging image with tag: $COMPOUND_TAG"
docker tag "$REPO_PREFIX"-tvapp:LATEST "$REPO_PREFIX"-tvapp:"$COMPOUND_TAG"
docker tag "$REPO_PREFIX"-tvapi:LATEST "$REPO_PREFIX"-tvapi:"$COMPOUND_TAG"
