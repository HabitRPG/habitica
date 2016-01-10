#!/bin/bash

echo Installing nvm...
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
source ~/.profile

echo Setting up node...
nvm install
nvm use
nvm alias default current

echo Update npm...
npm install -g npm

echo Installing global modules...
npm install -g gulp bower grunt-cli

echo Installing Habitica...
npm install --no-bin-links
