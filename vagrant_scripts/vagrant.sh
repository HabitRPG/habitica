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
# Needed for running e2e tests
echo export DISPLAY=:99 >> /home/vagrant/.bashrc

# Prevent warnings: "dpkg-preconfigure: unable to re-open stdin ..."
export DEBIAN_FRONTEND=noninteractive

echo Updating repositories...
apt-get update -qq

echo Installing Unix build tools - needed for node-gyp to use make...
apt-get install -qq build-essential

echo Installing python sofrware properties...
apt-get install -qq python-software-properties

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

echo Adding PPA repository for gcc...
add-apt-repository ppa:ubuntu-toolchain-r/test
apt-get update -qq

echo Installing gcc 4.8...
apt-get install -qq gcc-4.8 g++-4.8

update-alternatives --remove-all gcc
update-alternatives --remove-all g++
update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 20
update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 20
update-alternatives --config gcc
update-alternatives --config g++

echo Installing Git...
apt-get install -qq git

echo Installing curl...
apt-get install -qq curl

echo Installing Xvfb...
apt-get install -qq xvfb
echo Installing Java7...
apt-get install -qq openjdk-7-jre 
echo Downloading Firefox...
wget http://sourceforge.net/projects/ubuntuzilla/files/mozilla/apt/pool/main/f/firefox-mozilla-build/firefox-mozilla-build_40.0.3-0ubuntu1_amd64.deb/download -O firefox.deb >/dev/null 2>&1
echo Installing Firefox...
dpkg -i firefox.deb
rm firefox.deb

echo Installing ntp...
apt-get install -qq ntp


## # echo Seeding Mongodb...
## node ./src/seed.js
## no longer required - see comments in src/seed.js

# Uncomment both lines to autostart the habitica server when provisioning
# echo Starting Habitica server...
# autostart_habitrpg

