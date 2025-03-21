#!/bin/bash

if [[ ! "$1" ]]; then
  echo "taskName missing"
  exit 1
fi

echo "run task got $1"

NODE_ENV=${NODE_ENV:-development}
EXEC_DIR="$(./scripts/helpers/get_folder_path.sh)/infrastructure/database/tasks/runners"


NODE_ENV=$NODE_ENV yarn run ts-node -T $EXEC_DIR $1
