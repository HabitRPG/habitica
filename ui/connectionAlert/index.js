exports.create = function(model) {

  this.connect = function() {
    // Hide the reconnect link for a second after clicking it
    model.set('hideReconnect', true)
    setTimeout(function() {
      model.set('hideReconnect', false)
    }, 1000)
    model.socket.socket.connect()
  }

  this.reload = function() {
    window.location.reload()
  }
}
