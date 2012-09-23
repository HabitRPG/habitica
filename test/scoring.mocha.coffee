{expect, calls} = require 'derby/node_modules/racer/test/util' #TODO what is this?
{DetachedModel: Model, ResMock} = require 'derby/test/mocks'

## mock model
#model = {
#  data: {}
#  set: (path, val) ->
#    @data[path] = val
#  get: (path) ->
#    @data[path]
#  }

describe 'Scoring', ->
  user = null
  model = null

  it 'should save initial user correctly', (done) ->
    console.log 'teest'
    model = new Model
    model.set '_user', {hp:50}
    user = model.get '_user'
    expect user.get('hp').to.eql 5
    done()
