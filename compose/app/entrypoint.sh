#!/bin/bash

set -e
cmd="$@"

>&2 echo "Waiting for mongodb server to start - sleeping"
sleep 5

exec $cmd
