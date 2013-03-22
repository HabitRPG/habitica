utils = require('utils')

module.exports = ->
  baseUrl = 'http://localhost:3000'
  casper = require("casper").create
    clientScripts: 'lib/lodash.min.js'
  getModel = (cb)->
    casper.echo 'Loading model...'
    casper.waitFor(
                    -> #check function
                      casper.evaluate ->
                        user = window.DERBY.app.model.get('_user')
                        #wait till all fields get ready
                        check = (typeof user == "object" && typeof user.stats == "object" && typeof user.stats.exp == 'number')
                        #assign to the window so we can access it later
                        window.userCopy = userCopy = {}
                        #dirty hack to get all fields in the object
                        for k of user
                          userCopy[k] = user[k]
                        check
                    -> #run this if check passed
                      model = casper.evaluate ->
                        {user: window.userCopy}                      
                      casper.echo '...model loaded'
                      utils.dump model.user.stats
                      cb model 
                  )

  {
  casper: casper
  baseUrl: baseUrl
  playUrl: baseUrl + '/?play=1'
  utils: utils
  getModel: getModel
  }
