
  appExports.deleteAccount = (e, el) ->
    model.del "users.#{user.get('id')}", ->
      location.href = "/logout"


