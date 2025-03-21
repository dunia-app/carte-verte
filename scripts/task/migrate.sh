#!/bin/bash

# if [[ ! "$1" ]]; then
#   echo "migration name missing"
#   exit 1
# fi

NODE_ENV=${NODE_ENV:-development}

EXT='js'
BASE_PATH='./dist/src'

NODE_ENV=$NODE_ENV yarn migrate --store="$BASE_PATH/infrastructure/database/tasks/migrations_setup/store.$EXT" \
             --migrations-dir="$BASE_PATH/infrastructure/database/tasks/migrations" \
             --compiler="ts:./scripts/task/migrate_compiler.js" up \
             --matches="*.js"
