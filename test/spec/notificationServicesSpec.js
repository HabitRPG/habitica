'use strict';

//TODO mock bootstrapGrowl, add remaining tests
describe('notificationServices', function() {
  var notification;

  beforeEach(function() {
    module(function($provide){
      $provide.value('User', {});
    });

    inject(function(Notification) {
      notification = Notification;
    });
  });

  it('notifies coins amount', function() {
    var SILVER_COIN = "<span class='notification-icon shop_silver'></span>";
    var GOLD_COIN = "<span class='notification-icon shop_gold'></span>";
    expect(notification.coins(0.01)).to.eql("1 " + SILVER_COIN);
    expect(notification.coins(0.1)).to.eql("10 " + SILVER_COIN);
    expect(notification.coins(1)).to.eql("1 " + GOLD_COIN);
    expect(notification.coins(12.34)).to.eql("12 " + GOLD_COIN +" 33 " + SILVER_COIN);
  });
});
