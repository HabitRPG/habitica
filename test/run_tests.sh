#!/bin/bash
# Configuration
TEST_DB=habitrpg_test
TEST_DB_URI="mongodb://localhost/$TEST_DB"
TEST_SERVER_PORT=3001

# Build assets
grunt build:dev

# Launch Node server and Selenium
echo "Recreating test database"
mongo "$TEST_DB" --eval "db.dropDatabase()"
./node_modules/protractor/bin/webdriver-manager update
./node_modules/protractor/bin/webdriver-manager start > /dev/null &
NODE_DB_URI="$TEST_DB_URI" PORT=$TEST_SERVER_PORT node ./src/server.js > /dev/null &
NODE_PID=$!
trap "kill $NODE_PID && curl http://localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer" EXIT

sleep 3 # Wait for Selenium
grunt karma:continuous && ./node_modules/protractor/bin/protractor protractor.conf.js
