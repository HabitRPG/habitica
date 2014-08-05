FROM ubuntu:trusty

MAINTAINER Thibault Cohen <titilambert@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

### Init

RUN apt-get update

### Deps

RUN apt-get install -y git vim graphicsmagick nodejs phantomjs npm pkgconf libcairo2-dev

### Installation

RUN mkdir -p /opt/habitrpg/build

RUN cd /opt && git clone https://github.com/HabitRPG/habitrpg.git

RUN cd /opt/habitrpg && git pull

RUN cd /opt/habitrpg && npm install -g grunt-cli bower

RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN cd /opt/habitrpg && npm install || true

RUN cd /opt/habitrpg && bower install --allow-root

# Add config file
ADD ./config.json /opt/habitrpg/

# Run server

CMD cd /opt/habitrpg && ip a && grunt run:dev

