#!/bin/bash

TARGET=${TARGET:-development}


case $TARGET in
  development)
    echo "using dev"
    DEPLOY_TARGET="dev"
    ;;
  production)
    echo "using prod"
    DEPLOY_TARGET='prod'
    ;;
  staging)
    DEPLOY_TARGET='staging'
    ;;
esac


echo "deploy target is $DEPLOY_TARGET"
