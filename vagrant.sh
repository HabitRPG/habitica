#!/usr/bin/env bash
#
# Habitica provisioning script

# function for autostart
function autostart_habitrpg {
    update_config=$'Please update config.json with your values\nfor ADMIN_EMAIL, SMTP_USER, SMTP_PASS and SMTP_SERVICE,\nthen run "vagrant reload --provision"'

    # check if config.json exists, then check if the defaults are still in place
    if [ -e config.json ];
    then
        if grep -Fq 'ADMIN_EMAIL": "you@yours.com' config.json;
        then
            echo "$update_config";
            exit;
        else
            npm start
        fi
    else
        cp config.json.example config.json;
        echo "$update_config";
        exit;
    fi
}

# Main provisioning
echo Setting up Habitica...
echo cd /vagrant >> /home/vagrant/.bashrc

# Prevent warnings: "dpkg-preconfigure: unable to re-open stdin ..."
export DEBIAN_FRONTEND=noninteractive

echo Updating repositories...
apt-get update -qq

echo Installing Unix build tools - needed for node-gyp to use make...
apt-get install -qq build-essential

echo Installing GraphicsMagick - provides gm and convert...
apt-get install -qq graphicsmagick

echo Installing phantomjs and dependency...
apt-get install -qq libicu48

echo Installing requirements for grunt-spritesmith...
apt-get install -qq pkg-config libcairo2-dev libjpeg-dev

# Import MongoDB public GPG key
# http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

# Create a list file for MongoDB
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list

echo Installing Mongodb...
apt-get update
apt-get install mongodb-10gen
apt-get install -y mongodb-org=2.6.4 mongodb-org-server=2.6.4 mongodb-org-shell=2.6.4 mongodb-org-mongos=2.6.4 mongodb-org-tools=2.6.4

echo Installing Git...
apt-get install -qq git

echo Installing npm...
apt-get install -qq python-software-properties
echo Adding repository node.js...
apt-add-repository -y ppa:chris-lea/node.js
echo Updating repositories...
apt-get update -qq
echo Installing node.js
apt-get install -qq nodejs

cd /vagrant

echo Installing gulp/bower...
npm install -g gulp grunt-cli bower

echo Installing Habitica
npm install --no-bin-links

echo Installing Bower packages
sudo -H -u vagrant bower --config.interactive=false install -f

## # echo Seeding Mongodb...
## node ./src/seed.js
## no longer required - see comments in src/seed.js

# Uncomment both lines to autostart the habitica server when provisioning
# echo Starting Habitica server...
# autostart_habitrpg

