FROM mongo:3.4.4

# add backup scripts
ADD backup.sh /usr/local/bin/backup
ADD list-backups.sh /usr/local/bin/list-backups
ADD restore.sh /usr/local/bin/restore

# make them executable
RUN chmod +x /usr/local/bin/backup && \
    chmod +x /usr/local/bin/list-backups && \
    chmod +x /usr/local/bin/restore
