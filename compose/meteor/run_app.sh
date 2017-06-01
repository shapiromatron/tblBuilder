#!/bin/bash

export "R_LIBS=/home/app/R_libs"
export "PORT=3000"
export "METEOR_SETTINGS=$(cat /app/settings.json)"
export "MONGO_URL=mongodb://mongo:27017/tblBuilder"

/usr/local/bin/forever start \
    -c /usr/local/bin/node \
    -l /app/logs/tblBuilder.log \
    -o /app/logs/tblBuilder.stdout.log \
    -e /app/logs/tblBuilder.stderr.log \
    -a /app/production/bundle/main.js

/usr/local/bin/forever --fifo logs 0
