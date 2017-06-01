#!/bin/bash

# stop on errors
set -e

echo "creating backup"
echo "---------------"

FILENAME="tblBuilder-$(date +"%Y-%m-%dT%H_%M").gz"
mongodump --archive=/data/backups/$FILENAME --gzip --db tblBuilder

echo "successfully created backup $FILENAME"
