#!/bin/bash
# Configuration
TEST_DB=habitrpg_test
TEST_DB_URI="mongodb://localhost/$TEST_DB"
TEST_SERVER_PORT=3001

# Build assets
grunt build:test

# Launch Node server and Selenium
echo "= Recreating test database"
mongo "$TEST_DB" --eval "db.dropDatabase()"

if [ -z "$TRAVIS" ]; then
  if [ -z "$1" ] || [ "$1" == "protractor" ]; then
    ./node_modules/protractor/bin/webdriver-manager update
    ./node_modules/protractor/bin/webdriver-manager start > /dev/null &
    trap "curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer" EXIT

    # Wait for selenium
    MAX_WAIT=30
    WAITED=0
    until nc -z localhost 4444; do
      if [ $WAITED -ge $MAX_WAIT ]; then
        echo "Waited $MAX_WAIT seconds, but Selenium never responded" >&2
        kill $NODE_PID
        exit 1
      fi
      sleep 1
      let 'WAITED+=1'
    done
  fi
fi

NODE_DB_URI="$TEST_DB_URI" PORT=$TEST_SERVER_PORT node ./website/src/server.js > /dev/null &
NODE_PID=$!
trap "kill $NODE_PID" EXIT

if [ -z "$1" ] || [ "$1" == "mocha:api" ]; then
  echo "= Running mocha api unit specs"
  NODE_ENV=testing mocha || exit $?
fi

if [ -z "$1" ] || [ "$1" == "mocha:common" ]; then
  echo "= Running mocha common unit specs"
  NODE_ENV=testing mocha test/common || exit $?
fi

# If we're only running protractor, we need to let the server spin up.
if [ "$1" == "protractor" ]; then
  sleep 10
fi

if [ -z "$TRAVIS" ]; then
  if [ -z "$1" ] || [ "$1" == "protractor" ]; then
    echo "= Running protractor specs"
    NODE_ENV=testing ./node_modules/protractor/bin/protractor protractor.conf.js || exit $?
  fi
fi

if [ -z "$1" ] || [ "$1" == "karma" ]; then
  echo "= Running karma specs"
  NODE_ENV=testing grunt karma:continuous || exit $?
fi
