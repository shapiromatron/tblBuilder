FROM node:4.8.4
# node version dependent on meteor version

# (even if copied as root you still need to change)
# https://github.com/moby/moby/issues/6119
COPY ./compose/meteor/entrypoint.sh /entrypoint.sh
COPY ./compose/meteor/run_app.sh /run_app.sh
COPY ./settings/settings.json /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY ./r_requirements.sh /r_requirements.sh

# 1) add the R apt-source
# 2) install python and R
# 3) create paths and users
# 4) change executable permissions
RUN sh -c 'echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key adv --keyserver hkp://keys.gnupg.net:80 --recv-key 6212B7B7931C4BB16280BA1306F90DE5381BA480 && \
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
    chmod +x /entrypoint.sh && \
    chmod +x /run_app.sh && \
    chmod +x /r_requirements.sh && \
    \
    chown -R app:app /app && \
    chown app:app /entrypoint.sh && \
    chown app:app /run_app.sh && \
    chown app:app /r_requirements.sh

USER app

# 1) install R packages
# 2) install python packages
RUN export "R_LIBS=/home/app/R_libs" && \
    mkdir /home/app/R_libs && \
    bash /r_requirements.sh && \
    \
    pip install --user -r /requirements.txt

USER root
COPY ./compose/meteor/src/src.tar.gz /app/src.tar.gz
COPY ./src/private /app/src/private
RUN chown -R app:app /app

USER app
RUN cd /app && \
    bsdtar -xzvf src.tar.gz && \
    npm install --prefix /app/bundle/programs/server --production

ENTRYPOINT ["/entrypoint.sh"]
