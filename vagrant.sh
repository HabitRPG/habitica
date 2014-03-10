#!/usr/bin/env bash

update_config=$'Please update config.json with your values\nfor ADMIN_EMAIL, SMTP_USER, SMTP_PASS and SMTP_SERVICE,\nthen run "vagrant reload --provision"'

cd /vagrant
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
