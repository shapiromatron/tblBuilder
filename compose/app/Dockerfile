FROM node:4.8.2
# node version depends on meteor version

ARG json_settings

# install latest R
# install base python 2.7
# install meteor
RUN sh -c 'echo "deb http://cran.rstudio.com/bin/linux/debian jessie-cran3/" >> /etc/apt/sources.list' && \
    apt-key adv --keyserver keys.gnupg.net --recv-key 381BA480 && \
    apt-get update && \
    apt-get install -y python python-dev python-pip r-base r-base-dev && \
    apt-get clean && \
    curl https://install.meteor.com/ | sh && \
    npm install forever -g && \
    mkdir -p /app/production && \
    mkdir -p /app/logs && \
    groupadd -r app && \
    useradd -r -g app app

EXPOSE 3000
WORKDIR /app/project

COPY ./compose/app/entrypoint.sh /entrypoint.sh
COPY ./compose/app/run_app.sh /run_app.sh
COPY ${json_settings} /app/settings.json
COPY ./requirements.txt /requirements.txt
COPY . /app/project

RUN bash ./r_requirements.sh  && \
    pip install -r /requirements.txt && \
    chown -R app /app && \
    chmod +x /entrypoint.sh && \
    chmod +x /run_app.sh && \
    npm install --production && \
    meteor build /app/production --directory --allow-superuser

ENTRYPOINT ["/entrypoint.sh"]
