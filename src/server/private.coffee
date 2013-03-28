_ = require 'underscore'
character = require "../app/character"

module.exports.middleware = (req, res, next) ->
  model = req.getModel()
  model.set '_stripePubKey', process.env.STRIPE_PUB_KEY
  return next()

module.exports.app = (appExports, model) ->

  appExports.showStripe = (e, el) ->
    token = (res) ->
      console.log(res);
      $.ajax({
         type: "POST",
         url: "/charge",
         data: res
      }).success ->
        window.location.href = "/"
      .error (err) ->
        alert err.responseText

    disableAds = if (model.get('_user.flags.ads') is 'hide') then '' else 'Disable Ads, '

    StripeCheckout.open
      key: model.get('_stripePubKey')
      address: false
      amount: 500
      name: "Checkout"
      description: "Buy 20 Tokens, #{disableAds}Support the Developers"
      panelLabel: "Checkout"
      token: token

  ###
    Buy Reroll Button
  ###
  appExports.buyReroll = (e, el, next) ->
    batch = new character.BatchUpdate(model)
    obj = model.get('_user')
    batch.set 'balance', obj.balance-1
    _.each obj.tasks, (task) -> batch.set("tasks.#{task.id}.value", 0) unless task.type == 'reward'
    batch.commit()

module.exports.routes = (expressApp) ->
  ###
    Setup Stripe response when posting payment
  ###
  expressApp.post '/charge', (req, res) ->
    stripeCallback = (err, response) ->
      if err
        console.error(err, 'Stripe Error')
        return res.send(500, err.response.error.message)
      else
        model = req.getModel()
        userId = model.get('_userId') #or model.session.userId # see http://goo.gl/TPYIt
        req._isServer = true
        model.fetch "users.#{userId}", (err, user) ->
          model.ref '_user', "users.#{userId}"
          model.set('_user.balance', model.get('_user.balance')+5)
          model.set('_user.flags.ads','hide')
          return res.send(200)

    api_key = process.env.STRIPE_API_KEY # secret stripe API key
    stripe = require("stripe")(api_key)
    token = req.body.id
    # console.dir {token:token, req:req}, 'stripe'
    stripe.charges.create
      amount: "500" # $5
      currency: "usd"
      card: token
    , stripeCallback