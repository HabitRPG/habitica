mongo = require 'mongoskin'
argv = require('optimist').argv
conf = require 'nconf'
conf.argv().env().file({ file: __dirname + "/config.json" })

migration = argv.f
throw 'Please specify migration file' unless migration

db = mongo.db(conf.get("NODE_DB_URI") + '?auto_reconnect', {safe:true})
require("./migrations/#{migration}") db, ->
  console.log 'all done'
  db.close()
  process.exit()