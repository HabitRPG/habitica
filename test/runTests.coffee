sh                = require('shelljs')
async             = require('async')
TEST_DB           = 'habitrpg_test'
TEST_DB_URI       = "mongodb://localhost/#{TEST_DB}"
TEST_SERVER_PORT  = 3001
MAX_WAIT          = 60

announce = (msg) ->
  sh.echo '\x1b[36m%s\x1b[0m', "TEST SUITE: #{msg}"

Suite =
  # Primary Task
  run: ->
    announce "Preparing the test environment."
    Suite.prepareEnvironment ->
      announce "Test prep complete. Waiting for server availability."
      Suite.awaitServers ->
        announce "Servers are ready. Beginning tests."
        Suite.summarize
          "API Specs":       Suite.runApiSpecs()
          "Common Specs":    Suite.runCommonSpecs()
          "End-to-End Specs": Suite.runE2ESpecs()
          "Karma Specs":      Suite.runKarmaSpecs()

  # Output summary report when tests are done.
  summarize: (results) ->
    anyFailed = 0
    sh.echo ""
    announce "Tests complete!\n\nSummary\n-------\n"
    for name, result of results
      if result is 0
        sh.echo '\x1b[36m%s\x1b[0m', "#{name}: \x1b[32mpassing"
      else
        anyFailed = 1
        sh.echo '\x1b[36m%s\x1b[0m', "#{name}: \x1b[31mfailing"
    sh.echo ""
    announce "Thanks for helping keep Habitica clean!"
    process.exit(anyFailed)

  # Prepare files, db, and spin up servers.
  prepareEnvironment: (cb) ->
    sh.exec "grunt build:test"
    sh.exec "mongo \"#{TEST_DB}\" --eval \"db.dropDatabase()\""
    sh.exec "./node_modules/protractor/bin/webdriver-manager update"

    # Spin this up even if we're not in a headless environment. Shouldn't matter.
    sh.exec "Xvfb :99 -screen 0 1024x768x24 -extension RANDR", silent: true, async: true

    sh.exec "./node_modules/protractor/bin/webdriver-manager start", silent: true, async: true
    sh.exec "NODE_DB_URI=\"#{TEST_DB_URI}\" PORT=\"#{TEST_SERVER_PORT}\" node ./website/src/server.js", silent: true, async: true
    cb()

  # Ensure both the selenium and node servers are available
  awaitServers: (cb) ->
    async.parallel [Suite.awaitSelenium, Suite.awaitNode], (err, results) ->
      throw err if err?
      cb()

  awaitSelenium: (cb) ->
    waited = 0
    interval = setInterval ->
      if sh.exec('nc -z localhost 4444').code is 0
        clearInterval(interval)
        cb()
      waited += 1
      if waited > MAX_WAIT
        clearInterval(interval)
        cb(new Error("Timed out waiting for Selenium"))
    , 1000

  awaitNode: (cb) ->
    waited = 0
    interval = setInterval ->
      if sh.exec('nc -z localhost 3001').code is 0
        clearInterval(interval)
        cb()
      waited += 1
      if waited > MAX_WAIT
        clearInterval(interval)
        cb(new Error("Timed out waiting for Node server"))
    , 1000

  runApiSpecs: ->
    announce "Running API Specs (Mocha)"
    sh.exec("NODE_ENV=testing ./node_modules/mocha/bin/mocha test/api.mocha.coffee").code

  runCommonSpecs: ->
    announce "Running Common Specs (Mocha)"
    sh.exec("NODE_ENV=testing ./node_modules/mocha/bin/mocha test/common").code

  runE2ESpecs: ->
    announce "Running End-to-End Specs (Protractor)"
    sh.exec("DISPLAY=:99 NODE_ENV=testing ./node_modules/protractor/bin/protractor protractor.conf.js").code

  runKarmaSpecs: ->
    announce "Running Karma Specs"
    sh.exec("NODE_ENV=testing grunt karma:continuous").code

Suite.run()
