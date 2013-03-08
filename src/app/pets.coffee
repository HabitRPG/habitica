###
  app exports
###
module.exports.app = (appExports, model) ->
  user = model.at '_user'

  user.on 'set', 'flags.dropsEnabled', (captures, args) ->
    console.log 'hi!'
    return unless captures == true
    # do drops enabled stuff
    $('#dropsEnabled-modal').show()
