FROM node:4.8.4
# node version dependent on meteor version

# https://github.com/moby/moby/issues/6119
COPY ./compose/meteor/install_meteor.sh /install_meteor.sh
COPY ./compose/meteor/entrypoint.sh /entrypoint.sh
COPY ./compose/meteor/run_app.sh /run_app.sh
COPY ./compose/meteor/dbClean.js /app/crons/dbClean.js
COPY ./settings/settings.json /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY ./r_requirements.sh /r_requirements.sh

# 1) add the R apt-source
# 2) install python and R
# 3) create paths and users
# 4) change executable permissions
RUN sh -c 'echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key adv --keyserver keys.gnupg.net --recv-key 6212B7B7931C4BB16280BA1306F90DE5381BA480 && \
    \
    apt-get update && \
    apt-get install -y python python-dev python-pip r-base r-base-dev bsdtar && \
    apt-get clean && \
    \
    npm install forever -g && \
    \
    mkdir -p /app/production && \
    mkdir -p /app/logs && \
    mkdir -p /app/crons && \
    \
    groupadd -r app && \
    useradd -m -d /home/app -g app app && \
    \
    chown -R app:app /app && \
    chown app:app /install_meteor.sh && \
    chown app:app /entrypoint.sh && \
    chown app:app /run_app.sh && \
    chown app:app /r_requirements.sh

USER app

# 1) change permissions
# 2) install R and r requirements
# 3) install python packages
RUN chmod +x /install_meteor.sh && \
    chmod +x /entrypoint.sh && \
    chmod +x /run_app.sh && \
    chmod +x /r_requirements.sh && \
    \
    export "R_LIBS=/home/app/R_libs" && \
    mkdir /home/app/R_libs && \
    bash /r_requirements.sh && \
    \
    pip install --user -r /requirements.txt

COPY ./src /app/src
USER root
RUN chown -R app:app /app

USER app
WORKDIR /app/src

RUN sh /install_meteor.sh && \
    echo "export PATH=${PATH}:$HOME/.meteor" >> ~/.bashrc

RUN /home/app/.meteor/meteor npm install --production && \
    /home/app/.meteor/meteor build /app/production --directory && \
    npm install --prefix /app/crons mongodb@2.2.30 underscore@1.8.3 && \
    cd /app/production/bundle/programs/server && /usr/local/bin/npm install

ENTRYPOINT ["/entrypoint.sh"]
