FROM ubuntu:trusty

MAINTAINER Sabe Jones <sabe@habitica.com>

# Avoid ERROR: invoke-rc.d: policy-rc.d denied execution of start.
RUN echo -e '#!/bin/sh\nexit 0' > /usr/sbin/policy-rc.d

# Install prerequisites
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    curl \
    git \
    libfontconfig1 \
    libfreetype6 \
    libkrb5-dev \
    python

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs

# Clean up package management
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Install global packages
RUN npm install -g npm@4
RUN npm install -g gulp grunt-cli bower mocha

# Clone Habitica repo and install dependencies
WORKDIR /habitrpg
RUN git clone https://github.com/HabitRPG/habitica.git /habitrpg
RUN npm install
RUN bower install --allow-root

# Create environment config file and build directory
RUN cp config.json.example config.json
RUN mkdir -p ./website/build

# Start Habitica
EXPOSE 3000
CMD ["npm", "start"]
