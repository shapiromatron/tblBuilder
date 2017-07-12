#!/bin/bash

# stop on errors
set -e

echo "creating backup"
echo "---------------"

FILENAME="tblBuilder-$(date +"%Y-%m-%dT%H_%M").gz"
mongodump \
    --db=tblBuilder \
    --archive=/data/backups/$FILENAME \
    --gzip

echo "successfully created backup $FILENAME"
