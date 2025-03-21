#!/bin/bash

NODE_ENV=${NODE_ENV:-development}

echo "orm-cli NODE_ENV = $NODE_ENV"
NODE_ENV=$NODE_ENV ts-node ./node_modules/typeorm/cli.js $@
