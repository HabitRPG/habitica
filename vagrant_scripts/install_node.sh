#!/bin/bash

echo Installing nvm...
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | NVM_DIR="/home/vagrant/.nvm" PROFILE="/home/vagrant/.profile" bash
echo "source /home/vagrant/.nvm/nvm.sh" >> /home/vagrant/.profile
echo "nvm install" >> /home/vagrant/.profile

chown -R vagrant:vagrant /home/vagrant/.nvm

source /home/vagrant/.profile

echo Setting up node...
cd /vagrant
nvm install
nvm use
nvm alias default current

echo Update npm...
npm install -g npm@4

echo Installing global modules...
npm install -g gulp mocha node-pre-gyp
