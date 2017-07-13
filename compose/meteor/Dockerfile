# Requires a path to table-builder configuration, for example:

FROM node:4.8.4
# node version dependent on meteor version

# 1) add the R apt-source
# 2) install python and R
# 3) install meteor
# 4) create repositories
RUN sh -c 'echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key adv --keyserver keys.gnupg.net --recv-key 6212B7B7931C4BB16280BA1306F90DE5381BA480 && \
    \
    apt-get update && \
    apt-get install -y python python-dev python-pip r-base r-base-dev && \
    apt-get clean && \
    \
    curl https://install.meteor.com/?release=1.5 | sh && \
    npm install forever -g && \
    \
    mkdir -p /app/production && \
    mkdir -p /app/logs && \
    mkdir -p /app/crons

COPY ./compose/meteor/entrypoint.sh /entrypoint.sh
COPY ./compose/meteor/run_app.sh /run_app.sh
COPY ./settings/settings.json /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY ./r_requirements.sh /r_requirements.sh
COPY ./dbClean.js /app/crons/dbClean.js

RUN groupadd -r app && \
    useradd -m -d /home/app -g app app && \
    chown app:app /entrypoint.sh && \
    chown app:app /run_app.sh && \
    chown app:app /requirements.txt && \
    chown app:app /r_requirements.sh && \
    chmod +x /entrypoint.sh && \
    chmod +x /run_app.sh && \
    chmod +x /r_requirements.sh

USER app
RUN export "R_LIBS=/home/app/R_libs" && \
    mkdir /home/app/R_libs && \
    bash /r_requirements.sh && \
    pip install --user -r /requirements.txt

USER root
COPY ./src /app/src
RUN chown -R app /app

USER app

WORKDIR /app/src

RUN npm install --prefix /app/crons mongodb@2.2.30 underscore@1.8.3 && \
    meteor npm install --production && \
    meteor build /app/production --directory && \
    cd /app/production/bundle/programs/server && /usr/local/bin/npm install

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
