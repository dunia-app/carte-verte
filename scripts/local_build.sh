#!/bin/bash

GIT_TAG=$(git describe --tags --abbrev=0)
TARGET=${1:-development}

if [[ ! "$TARGET" =~ ^(development|staging|production)$ ]]; then
  echo "usage: \
    ['development'|'staging'|'production']
  "
  exit 1
fi

echo "Target = $TARGET"
echo "GIT TAG = $GIT_TAG"

BRANCH_NAME=$TARGET

echo "BRANCH_NAME = $BRANCH_NAME"

if [[ "$TARGET" =~ production ]]; then
  BRANCH_NAME='master'
fi

# build
yarn typeorm:test schema:drop
yarn typeorm:test migration:run
yarn test
yarn build
"${BASH_SOURCE%/*}/check_valid_build.sh"
rm -rf fresh_build && ./scripts/copy_build_files.sh

# push
rm -rf backend_build
git clone -b $BRANCH_NAME git@github.com:dunia-app/backend_build.git
cd backend_build
ls | xargs rm -rf
cp -R ../fresh_build/* .
git add .
git tag -af $GIT_TAG -m "Build $GIT_TAG"
git diff-index --quiet HEAD || git commit -m "Build $GIT_TAG"
git push --follow-tags
cd .. && rm -rf backend_build


# deploy
case $TARGET in
  development)
    DEPLOY_TARGET='dev'
    INSTANCE_NAME='dunia-backend-instance-1'
    ;;
  production)
    DEPLOY_TARGET='prod'
    INSTANCE_NAME='dunia-backend-production-1'
    ;;
  staging)
    DEPLOY_TARGET='staging'
    INSTANCE_NAME='dunia-backend-instance-1'
    ;;
esac

echo "INSTANCE_NAME = $INSTANCE_NAME"
echo "TARGET = $DEPLOY_TARGET"

gcloud compute ssh dunia@$INSTANCE_NAME --zone=europe-west1-b --command="bash -i -c 'TARGET=$DEPLOY_TARGET ruby ~/docker_setup/backend/update_backend_app.rb'"
