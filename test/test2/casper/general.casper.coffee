helpers = new require('./lib/helpers')()
casper = helpers.casper
utils = helpers.utils
url = helpers.playUrl

casper.on('remote.message'
           (msg) ->
             this.echo '[Console] : ' + msg
         )

# ---------- Basic Test ------------
casper.start url, ->        
  helpers.getModel (model) ->
    casper.test.assertEquals(typeof model.user.stats.exp, "number", 'exp is number')
    casper.test.assertEquals(model.user.stats.exp, 0, 'exp == 0')    
    casper.echo 'Clicking...'
    casper.click '.habits a[data-direction="up"]'
    casper.echo '...clicked'    
    helpers.getModel (model) ->      
      casper.test.assertEquals(model.user.stats.exp, 7.5, 'exp == 7.5')
  

# ---------- Run ------------
casper.run ->
  casper.test.renderResults true