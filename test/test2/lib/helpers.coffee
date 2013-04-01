utils = require('utils')

#enable this to get remote console output, useful for debug.
casper.on "remote.message", (msg)->
  casper.echo "Remote console: "+msg

casper.helpers = (->
  baseUrl = 'http://localhost:3000'
  getModel = (cb)->
    casper.waitFor(
                    -> #check function
                      casper.evaluate ->
                        user = window.DERBY.app.model.get('_user')
                        #wait till all fields get ready
                        check = (typeof user == "object" && typeof user.stats == "object" && typeof user.stats.exp == 'number')
                        #assign to the window so we can access it later
                        window.userCopy = userCopy =
                        {}
                        #dirty hack to get all fields in the object
                        for k of user
                          userCopy[k] = user[k]
                        check
                    -> #run this if check passed
                      model = casper.evaluate ->
                        {user: window.userCopy}
                      cb null, model
                  )

  {
  casper: casper
  baseUrl: baseUrl
  playUrl: baseUrl + '/?play=1'
  getModel: getModel
  uid: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  })()
