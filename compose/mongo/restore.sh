#!/bin/bash

# stop on errors
set -e

# check that we have an argument for a filename candidate
if [[ $# -eq 0 ]] ; then
    echo 'usage:'
    echo '    docker-compose exec mongo restore <backup-file>'
    echo ''
    echo 'to get a list of available backups, run:'
    echo '    docker-compose exec mongo list-backups'
    exit 1
fi

# set the backupfile variable
BACKUPFILE=/data/backups/$1

# check that the file exists
if ! [ -f $BACKUPFILE ]; then
    echo "backup file not found"
    echo 'to get a list of available backups, run:'
    echo '    docker-compose exec mongo list-backups'
    exit 1
fi

echo "beginning restore from $1"
echo "-------------------------"

mongorestore \
    --db tblBuilder \
    --gzip \
    --archive=$BACKUPFILE \
    --stopOnError \
    --drop
