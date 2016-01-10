#!/bin/bash

echo Installing nvm...
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.1/install.sh | bash
source ~/.profile

echo Setup node 4...
nvm install 4
nvm use 4
nvm alias default 4

echo Update npm...
npm install -g npm

echo Installing global modules...
npm install -g gulp bower grunt-cli

echo Installing Habitica...
npm install --no-bin-links
