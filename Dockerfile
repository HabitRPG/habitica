FROM ubuntu:trusty

MAINTAINER Sabe Jones <sabe@habitica.com>

# Avoid ERROR: invoke-rc.d: policy-rc.d denied execution of start.
RUN echo "#!/bin/sh\nexit 0" > /usr/sbin/policy-rc.d

# Install prerequisites
RUN apt-get update
RUN apt-get install -y \
    build-essential \
    curl \
    git \
    libkrb5-dev \
    python

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN apt-get install -y nodejs

# Clean up package management
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*

# Clone Habitica repo and install dependencies
RUN git clone https://github.com/HabitRPG/habitrpg.git
RUN npm install -g gulp grunt-cli bower
RUN cd /habitrpg && npm install
RUN cd /habitrpg && bower install --allow-root

# Create environment config file and build directory
RUN cd /habitrpg && cp config.json.example config.json
RUN cd /habitrpg && sed -i 's/localhost/0.0.0.0/g' config.json # CHANGE IP TO MONGO CONTAINER IP
RUN mkdir -p /habitrpg/website/build

# Start Habitica
EXPOSE 3000
WORKDIR /habitrpg/
CMD ["npm", "start"]
