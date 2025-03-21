#!/bin/bash

EXEC_DIR="$(./get_folder_path.sh)/$1"
COMMAND="ts-node -T"

# shift arguments
shift

if [ "$EXEC_DIR" =~ dist ]; then
  COMMAND="node"
fi

yarn run $COMMAND $EXEC_DIR $@
