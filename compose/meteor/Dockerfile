# node version dependent on meteor version
FROM node:8.9.4

# (even if copied as root you still need to change)
# https://github.com/moby/moby/issues/6119
COPY ./compose/meteor/entrypoint.sh /entrypoint.sh
COPY ./compose/meteor/run_app.sh /run_app.sh
COPY ./settings/settings.json /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY ./r_requirements.sh /r_requirements.sh

# add rstudio debian install for R (requires version >3.3)
# https://cran.r-project.org/bin/linux/debian/
# install R from apt-get
# install python 3.6 from source :/
RUN \
    sh -c 'echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key adv --keyserver keys.gnupg.net --recv-key '6212B7B7931C4BB16280BA1306F90DE5381BA480' && \
    \
    apt-get update && \
    apt-get install -y wget bsdtar r-base r-base-dev && \
    apt-get clean && \
    \
    wget https://www.python.org/ftp/python/3.6.5/Python-3.6.5.tgz && \
    tar zxf Python-3.6.5.tgz && \
    cd ./Python-3.6.5 && \
    ./configure && \
    make && \
    make altinstall && \
    cd .. && \
    rm Python-3.6.5.tgz && \
    rm -rf ./Python-3.6.5

# create paths and users
# change executable permissions
RUN npm install forever -g && \
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
    /usr/local/bin/pip3.6 install --user -r /requirements.txt

USER root
COPY ./compose/meteor/src/src.tar.gz /app/src.tar.gz
COPY ./src/private /app/src/private
RUN chown -R app:app /app

USER app
RUN cd /app && \
    bsdtar -xzvf src.tar.gz && \
    npm install --prefix /app/bundle/programs/server --production

ENTRYPOINT ["/entrypoint.sh"]
