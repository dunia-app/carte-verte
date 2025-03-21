#!/bin/bash

if [ -d "./src" ]; then
  echo "./src"
else
  echo "./dist/src"
fi
