#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run the necessary setup commands
echo "Running setup commands..."

# Run TypeORM migrations
yarn typeorm migration:run

# Run the custom task migrate
yarn task migrate

# Seed the database
yarn seed

# Create the cloud scheduler tasks
# NODE_ENV=$NODE_ENV APP_URL=$APP_URL yarn deploy_task

# Start the application using the default CMD
echo "Starting application..."
exec "$@"
