#!/bin/bash

if [[ ! "$1" ]]; then
  echo "name missing"
  exit 1
fi

BASE_PATH="$(./scripts/helpers/get_folder_path.sh)"

yarn migrate -t "$BASE_PATH/infrastructure/database/tasks/migrations_setup/template.ts" --migrations-dir="$BASE_PATH/infrastructure/database/tasks/migrations" create "$1"
