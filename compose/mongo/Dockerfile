FROM mongo:3.2.15

# add backup scripts
ADD backup.sh /usr/local/bin/backup
ADD list-backups.sh /usr/local/bin/list-backups
ADD restore.sh /usr/local/bin/restore

# add data cleanup scripts
ADD /underscore.js /underscore.js
ADD /dbClean.js /dbClean.js

# make them executable
RUN chmod +x /usr/local/bin/backup && \
    chmod +x /usr/local/bin/list-backups && \
    chmod +x /usr/local/bin/restore
