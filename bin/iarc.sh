#!/bin/bash

# use local development environment if it exists
if [ -f ./bin/iarc.local.sh ]; then
   source ./bin/iarc.local.sh
   exit
fi

# Create the session to be used
tmux new-session -d -s iarcTblBuilder

# Split the window
tmux split-window -v
tmux split-window -h
tmux select-pane -t 0

# Run commands
tmux send-keys -t 0 "cd ~/dev/tblBuilder && MONGO_URL=mongodb://127.0.0.1:3001/meteor meteor --settings=iarc.settings.json" enter
tmux send-keys -t 1 "mongod --dbpath ~/dev/tblBuilder/.meteor/local/iarcDB --port 3001" enter
tmux send-keys -t 2 "workon deploy && cd tblBuilder && fab --list" enter

# attach to shell
tmux select-pane -t 0
tmux attach-session
