utils = require('utils')

module.exports = ->
  baseUrl = 'http://localhost:3000'
  casper = require("casper").create
    clientScripts: 'lib/lodash.min.js'
  getModel = (cb)->
    casper.echo 'Getting model...'
    casper.waitFor(
                    ->
                      casper.evaluate ->
                        user = window.DERBY.app.model.get('_user')
                        check = (typeof user == "object" && typeof user.stats == "object" && typeof user.stats.exp == 'number')
                        window.userCopy = userCopy = {} #assign to the window so we can access it later
                        for k of user
                          userCopy[k] = user[k] #dirty hack to get all fields in the object
                        if check then console.log '...sending model...'
                        check
                    ->
                      casper.echo '...model ready...'
                      cb casper.evaluate ->
                        window.userCopy
                  )

  {
  casper: casper
  baseUrl: baseUrl
  playUrl: baseUrl + '/?play=1'
  utils: utils
  getModel: getModel
  }
