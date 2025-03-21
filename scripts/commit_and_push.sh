#!/bin/bash

if [[ ! "$1" =~ ^(major|minor|patch|premajor|preminor|prepatch)$ ]]; then
  echo "usage:\
   ['major'|'minor'|'patch'|'premajor'|'preminor'|'prepatch']\
   ['git comment']"
  exit 1
fi

if "${BASH_SOURCE%/*}/check_valid_build.sh";then
  git add .
  if [[ ! "$2" ]]; then
    yarn version --$1 --no-commit-hooks
  else
    git commit -m "$2"
  fi

  git push --follow-tags
fi
