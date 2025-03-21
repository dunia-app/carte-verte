: "${ENV_FILE:?needs to be defined}"

yarn typeorm:prod schema:drop
yarn typeorm:prod migration:run
yarn seed:prod
