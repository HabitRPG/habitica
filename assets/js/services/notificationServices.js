
angular.module("notificationServices", []).factory("Notification", function() {
  var active, data, fixMe, timer;
  fixMe = {
    push: function() {},
    get: function() {},
    animate: function() {},
    clearTimer: function() {},
    init: function() {}
  };
  return fixMe;
  data = {
    message: ""
  };
  active = false;
  timer = null;
  return {
    hide: function() {
      $("#notification").fadeOut(function() {
        $("#notification").css("webkit-transform", "none");
        $("#notification").css("top", "-63px");
        $("#notification").css("left", "0px");
        return setTimeout((function() {
          return $("#notification").show();
        }), 190);
      });
      active = false;
      return timer = null;
    },
    animate: function() {
      if (timer) {
        clearTimeout(timer);
        timer = setTimeout(this.hide, 2000);
      }
      if (active === false) {
        active = true;
        $("#notification").transition({
          y: 63,
          x: 0
        });
        return timer = setTimeout(this.hide, 2000);
      }
    },
    push: function(message) {
      data.message = "";
      switch (message.type) {
        case "stats":
          if ((message.stats.exp != null) && (message.stats.gp != null)) {
            data.message = "Experience: " + message.stats.exp + "<br />GP: " + message.stats.gp.toFixed(2);
          }
          if (message.stats.hp) {
            data.message = "HP: " + message.stats.hp.toFixed(2);
          }
          if (message.stats.gp && !(message.stats.exp != null)) {
            data.message = "<br />GP: " + message.stats.gp.toFixed(2);
          }
          break;
        case "text":
          data.message = message.text;
      }
      return this.animate();
    },
    get: function() {
      return data;
    },
    clearTimer: function() {
      clearTimeout(timer);
      timer = null;
      return active = false;
    },
    init: function() {
      return timer = setTimeout(this.hide, 2000);
    }
  };
});
