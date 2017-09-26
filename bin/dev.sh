#!/bin/bash

# Create the session to be used
tmux new-session -d -s tblBuilder

# Split the window
tmux split-window -v
tmux split-window -h
tmux select-pane -t 1
tmux split-window -h

# Run commands
tmux send-keys -t 1 "workon tblBuilder && cd src && MONGO_URL=mongodb://127.0.0.1:3001/meteor meteor --settings=../settings/settings.json" enter
tmux send-keys -t 2 "workon tblBuilder && mongod --port 3001" enter
tmux send-keys -t 3 "workon tblBuilder && cd src && meteor shell" enter
tmux send-keys -t 4 "workon tblBuilder && cd src" enter

# attach to shell
tmux select-pane -t 4
tmux attach-session
