#!/bin/bash

if [[ ! "$1" ]]; then
  echo "command missing"
  exit 1
fi

STATE="$(./scripts/helpers/get_folder_path.sh)/infrastructure/database/tasks/migrations/state"



yarn migrate --compiler="ts:./scripts/helpers/migrate_compiler.js" "$@"
