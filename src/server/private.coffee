_ = require 'underscore'

module.exports.middleware = (req, res, next) ->
  model = req.getModel()
  model.set '_stripePubKey', process.env.STRIPE_PUB_KEY
  return next()

module.exports.app = (appExports, model) ->

  appExports.showStripe = (e, el) ->
    token = (res) ->
      console.log(res);
      $.ajax({
             type:"POST",
             url:"/charge",
             data:res
             }).success ->
                          window.location.href = "/"
        .error (err) ->
                 alert err.responseText

    StripeCheckout.open
      key: model.get('_stripePubKey')
      address: false
      amount: 500
      name: "Checkout"
      description: "Removes ads and grants 20 additional tokens."
      panelLabel: "Checkout"
      token: token

  ###
    Buy Reroll Button
  ###
  appExports.buyReroll = (e, el, next) ->
    user = model.at('_user')
    tasks = user.get('tasks')
    user.set('balance', user.get('balance')-1)
    _.each tasks, (task) -> task.value = 0 unless task.type == 'reward'
    user.set('tasks', tasks)
    window.DERBY.app.dom.clear()
    window.DERBY.app.view.render(model)

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
        userId = model.session.userId
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