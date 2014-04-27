#!/usr/bin/env bash
#
# HabitRPG provisioning script

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
echo Setting up HabitRPG...
echo cd /vagrant >> /home/vagrant/.bashrc

echo Updating repositories...
apt-get update -qq

echo Installing Mongodb...
apt-get install -qq mongodb

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

echo Installing grunt/bower...
npm install -g grunt-cli bower

echo Installing HabitRPG
npm install

echo Seeding Mongodb...
node ./src/seed.js

# Uncomment both lines to autostart the habitrpg server when provisioning
# echo Starting HabitRPG server...
# autostart_habitrpg

