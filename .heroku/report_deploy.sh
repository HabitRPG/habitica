#!/bin/bash

DEVELOPER="someone"
if git rev-parse --git-dir > /dev/null 2>&1; then
    DEVELOPERS=$(git log -5 --pretty=format:'%an')
    IFS=$'\n'
    DEVELOPER=""
    for dev in $DEVELOPERS
    do
        if [ "$DEVELOPER" == "someone" ]; then
            if [[ ${dev} != *"[bot]"* ]]; then
                DEVELOPER=$dev
                continue
            fi
            continue
        fi
    done
fi

PARTS=$(cut -d"." -f1 <<< $BASE_URL)
SERVER_NAME=$(cut -d"/" -f3 <<< ${PARTS[0]})

SERVER_NAME=":$SERVER_EMOJI: $SERVER_NAME"

wget $SLACK_DEPLOY_URL --post-data="{\"server_name\": \"$SERVER_NAME\", \"developer\": \"$DEVELOPER\", \"base_url\": \"$BASE_URL\"}" -O /dev/null