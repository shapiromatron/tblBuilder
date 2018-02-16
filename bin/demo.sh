#!/bin/bash

# use local development environment if it exists
if [ -f ./bin/demo.local.sh ]; then
   source ./bin/demo.local.sh
   exit
fi

# Create the session to be used
tmux new-session -d -s demoTblBuilder

# Split the window
tmux split-window -v
tmux split-window -h
tmux select-pane -t 0

# Run commands
tmux send-keys -t 0 "cd ~/dev/tblBuilder/src && MONGO_URL=mongodb://127.0.0.1:3001/meteor meteor --settings=../settings/demo.settings.json" enter
tmux send-keys -t 1 "mongod --dbpath ~/dev/tblBuilder/src/.meteor/local/demoDB --port 3001" enter
tmux send-keys -t 2 "cd ~/dev/tblBuilder/src" enter

# attach to shell
tmux select-pane -t 0
tmux attach-session
