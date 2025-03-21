#!/bin/bash

NODE_ENV=${NODE_ENV:-development}
EXEC_DIR="$(./scripts/helpers/get_folder_path.sh)/infrastructure/database/fixtures"

NODE_ENV=$NODE_ENV yarn run ts-node -T $EXEC_DIR
