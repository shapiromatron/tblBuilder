# node version dependent on meteor version
FROM node:8.9.4

# (even if copied as root you still need to change)
# https://github.com/moby/moby/issues/6119
COPY ./compose/meteor/entrypoint.sh /entrypoint.sh
COPY ./compose/meteor/run_app.sh /run_app.sh
COPY ./compose/meteor/r-cran.pgp /r-cran.pgp
COPY ./settings/settings.json /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY ./r_requirements.sh /r_requirements.sh

# set locale to utf8: https://github.com/docker-library/docs/pull/703/files
# added [check-valid-until=no] & Acquire::Check-Valid-Until "false"; https://unix.stackexchange.com/questions/508724/failed-to-fetch-jessie-backports-repository
# Needs work to bring it up-to-date
RUN \
    echo "deb [check-valid-until=no] http://archive.debian.org/debian jessie-backports main" > /etc/apt/sources.list.d/jessie-backports.list && \
    sed -i '/deb http:\/\/deb.debian.org\/debian jessie-updates main/d' /etc/apt/sources.list && \
    apt-get -o Acquire::Check-Valid-Until=false update && \
    \
    sh -c 'echo "deb [check-valid-until=no] http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key add /r-cran.pgp && \
    \
    apt-get -o Acquire::Check-Valid-Until=false update && \
    apt-get -o Acquire::Check-Valid-Until=false install -y locales && \
    \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 && \
    export LC_ALL=en_US.UTF-8 && \
    export LANG=en_US.UTF-8 && \
    export LANGUAGE=en_US.UTF-8

ENV LANG en_US.utf8
ENV LC_ALL en_US.UTF-8

# add rstudio debian install for R (requires version >3.3)
# https://cran.r-project.org/bin/linux/debian/
# install R from apt-get
# install python 3.6 from source :/
RUN apt-get install -y wget bsdtar r-base r-base-dev && \
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
