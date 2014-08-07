FROM ubuntu:trusty

MAINTAINER Thibault Cohen <titilambert@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

### Init

RUN apt-get update

### Utils

RUN apt-get install -y git vim graphicsmagick nodejs phantomjs npm pkgconf libcairo2-dev libjpeg8-dev

### Installation

RUN cd /opt && git clone https://github.com/HabitRPG/habitrpg.git

#RUN cd /opt/habitrpg && git checkout -t origin/develop

RUN cd /opt/habitrpg && git pull

RUN cd /opt/habitrpg && npm install -g grunt-cli bower nodemon

RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN cd /opt/habitrpg && npm install

# Add config file

ADD ./config.json /opt/habitrpg/

RUN mkdir -p /opt/habitrpg/build

RUN cd /opt/habitrpg && bower install --allow-root

# Run server

RUN cd /opt/habitrpg && grunt build:prod 

CMD cd /opt/habitrpg && grunt nodemon
