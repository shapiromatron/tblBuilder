#!/bin/bash

export PORT=3000
export MONGO_URL=mongodb://mongo:27017/tblBuilder
export ROOT_URL=http://localhost:3000
export METEOR_SETTINGS=$(cat $METEOR_SETTINGS_FILE)
cd /app/production/bundle/programs/server && /usr/local/bin/npm install

/usr/local/bin/forever start \
    -c /usr/local/bin/node \
    -l /app/logs/tblBuilder.log \
    -o /app/logs/tblBuilder.stdout.log \
    -e /app/logs/tblBuilder.stderr.log \
    -a /app/production/bundle/main.js

/usr/local/bin/forever --fifo logs 0
