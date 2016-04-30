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

echo Installing python software properties...
apt-get install -qq python-software-properties

echo Installing sprite dependencies...
/vagrant/vagrant_scripts/install_sprite_dependencies.sh

echo Installing Mongodb...
/vagrant/vagrant_scripts/install_mongo.sh

echo Installing gcc...
/vagrant/vagrant_scripts/install_gcc.sh

echo Installing Git...
apt-get install -qq git

echo Installing curl...
apt-get install -qq curl

echo Installing test dependencies...
/vagrant/vagrant_scripts/install_test_dependencies.sh

echo Installing ntp...
apt-get install -qq ntp

echo Installing nvm, node and global node modules...
/vagrant/vagrant_scripts/install_node.sh

echo "'vagrant up' is finished. Continue with the instructions at http://habitica.wikia.com/wiki/Setting_up_Habitica_Locally"

# Uncomment both lines to autostart the habitica server when provisioning
# echo Starting Habitica server...
# autostart_habitrpg

