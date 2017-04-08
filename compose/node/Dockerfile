FROM node:4.8.2

RUN apt-get -y update && \
    apt-get -y install python python-dev python-pip r-base

COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt \
    && groupadd -r app \
    && useradd -r -g app app

RUN curl https://install.meteor.com/ | sh

COPY . /app/project
RUN chown -R app /app

WORKDIR /app/project

RUN source ./r_requirements.sh

RUN su - app && \
    cd /app/project && \
    npm install --production && \
    meteor build /app/build


EXPOSE 3000

