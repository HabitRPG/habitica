DEVELOPERS=$(git log -5 --pretty=format:'%an')
PARTS=$(cut -d"." -f1 <<< $BASE_URL)
SERVER_NAME=$(cut -d"/" -f3 <<< ${PARTS[0]})

IFS=$'\n'
DEVELOPER=""
for dev in $DEVELOPERS
do
    if [ "$DEVELOPER" == "" ]; then
        if [[ ${dev} != *"[bot]"* ]]; then
            DEVELOPER=$dev
            continue
        fi
        continue
    fi
done

wget $SLACK_DEPLOY_URL --post-data="{\"server_name\": \"$SERVER_NAME\", \"developer\": \"$DEVELOPER\", \"base_url\": \"$BASE_URL\"}" -O /dev/null