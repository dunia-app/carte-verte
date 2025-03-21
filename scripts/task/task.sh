#!/bin/bash

if [[ ! "$1" ]]; then
  echo "action missing"
  echo "usage: \
    ['run_task'|'migrate'|'migrate:create']
  "
  exit 1
fi

ACTION="$1"
SCRIPT_DIR=`dirname $0`

shift

ACTION_CMD="$SCRIPT_DIR/$ACTION.sh $@"

$ACTION_CMD
