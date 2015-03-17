#!/bin/bash
# Configuration
TEST_DB=habitrpg_test
TEST_DB_URI="mongodb://localhost/$TEST_DB"
TEST_SERVER_PORT=3001

# Build assets
grunt build:dev

# Launch Node server and Selenium
echo "= Recreating test database"
mongo "$TEST_DB" --eval "db.dropDatabase()"

if [ -z "$TRAVIS" ]; then
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

NODE_DB_URI="$TEST_DB_URI" PORT=$TEST_SERVER_PORT node ./website/src/server.js > /dev/null &
NODE_PID=$!
trap "kill $NODE_PID" EXIT

echo "= Running mocha specs"
NODE_ENV=testing mocha || exit $?

if [ -z "$TRAVIS" ]; then
        echo "= Running protractor specs"
	NODE_ENV=testing ./node_modules/protractor/bin/protractor protractor.conf.js || exit $?
fi

echo "= Running karma specs"
NODE_ENV=testing grunt karma:continuous
