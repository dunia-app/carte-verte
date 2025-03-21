#!/bin/bash
BUILD_FILES="dist scripts data-source.ts package.json yarn.lock tsconfig.json ejs-template"
TARGET=${1:-fresh_build}

mkdir -p $TARGET
cp -R $BUILD_FILES $TARGET
