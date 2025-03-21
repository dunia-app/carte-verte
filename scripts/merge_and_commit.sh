#!/bin/bash

if [[ ! "$1" ]]; then
  echo "usage: \
   ['branch name to merge']\
   "
   exit 1
fi
# yarn version creates automatically an annotaged tag
 
git merge $1

if "${BASH_SOURCE%/*}/check_valid_build.sh";then
  git push --follow-tags
fi
