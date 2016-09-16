'use strict';

describe('notificationServices', function() {
  var notification;

  beforeEach(function() {
    sandbox.stub($, 'pnotify', function(){
      return { click: function(){}}
    });

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

    expect(notification.coins(0)).to.not.exist;
    expect(notification.coins(0.01)).to.eql("1 " + SILVER_COIN);
    expect(notification.coins(0.1)).to.eql("10 " + SILVER_COIN);
    expect(notification.coins(1)).to.eql("1 " + GOLD_COIN);
    expect(notification.coins(12.34)).to.eql("12 " + GOLD_COIN +" 33 " + SILVER_COIN);
  });

  it('sends crit notification', function() {
    notification.crit(5);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('crit');
    expect(arg.text).to.eql('Critical Hit! Bonus: 5%');
    expect(arg.icon).to.eql('glyphicon glyphicon-certificate');
  });

  it('sends drop notification for unspecified item', function() {
    notification.drop('msg');
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('drop');
    expect(arg.text).to.eql('msg');
    expect(arg.icon).to.eql(false);
  });

  it('sends drop notification for Egg', function() {
    var item = { type: 'Egg', key: 'wolf' };
    notification.drop('msg', item);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('drop');
    expect(arg.text).to.eql('msg');
    expect(arg.icon).to.eql('Pet_Egg_wolf');
  });

  it('sends drop notification for Hatching Potion', function() {
    var item = { type: 'HatchingPotion', key: 'red' };
    notification.drop('msg', item);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('drop');
    expect(arg.text).to.eql('msg');
    expect(arg.icon).to.eql('Pet_HatchingPotion_red');
  });

  it('sends drop notification for Food', function() {
    var item = { type: 'Food', key: 'meat' };
    notification.drop('msg', item);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('drop');
    expect(arg.text).to.eql('msg');
    expect(arg.icon).to.eql('Pet_Food_meat');
  });

  it('does not send exp notification if val < -50', function() {
    notification.exp(-51);
    expect($.pnotify).to.not.have.been.called;
  });

  it('sends exp notification if val >= -50', function() {
    notification.exp(50);
    notification.exp(0);
    notification.exp(-50);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledThrice;
    expect(arg.type).to.eql('xp');
    expect(arg.text).to.eql('+ 50 Experience');
    expect(arg.icon).to.eql('glyphicon glyphicon-star');
  });

  it('sends exp notification with rounded value', function() {
    notification.exp(50.23333);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('xp');
    expect(arg.text).to.eql('+ 50.2 Experience');
    expect(arg.icon).to.eql('glyphicon glyphicon-star');
  });

  it('sends error notification', function() {
    notification.error('there was an error');
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('danger');
    expect(arg.text).to.eql('there was an error');
    expect(arg.icon).to.eql('glyphicon glyphicon-exclamation-sign');
  });

  it('sends gp gained notification', function() {
    notification.gp(50, 4);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('gp');
    expect(arg.text).to.eql('+ 46 <span class=\'notification-icon shop_gold\'></span>');
    expect(arg.icon).to.eql(false);
  });

  it('sends hp notification', function() {
    notification.hp(10);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('hp');
    expect(arg.text).to.eql('+ 10 Health');
    expect(arg.icon).to.eql('glyphicon glyphicon-heart');
  });

  it('sends level up notification', function() {
    notification.lvl(10);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('lvl');
    expect(arg.text).to.eql('Level Up!');
    expect(arg.icon).to.eql('glyphicon glyphicon-chevron-up');
  });

  it('sends markdown parsed notification', function() {
    notification.markdown(":smile: - task name");
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('info');
    expect(arg.text).to.eql('<p><img class="habitica-emoji" style="height: 1.5em; width: 1.5em" src="https://s3.amazonaws.com/habitica-assets/cdn/emoji/smile.png" alt="smile"> - task name</p>\n');
    expect(arg.icon).to.eql(false);
  });

  it('does not send markdown notification if no text is given', function() {
    notification.markdown();

    expect($.pnotify).to.not.have.been.called;
  });

  it('sends mp notification', function() {
    notification.mp(10);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('mp');
    expect(arg.text).to.eql('+ 10 Mana');
    expect(arg.icon).to.eql('glyphicon glyphicon-fire');
  });

  it('sends streak notification', function() {
    notification.streak(10);
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('streak');
    expect(arg.text).to.eql('Streak Achievements: 10');
    expect(arg.icon).to.eql('glyphicon glyphicon-repeat');
  });

  it('sends text notification', function() {
    notification.text('task name');
    var arg = $.pnotify.args[0][0];

    expect($.pnotify).to.have.been.calledOnce;
    expect(arg.type).to.eql('info');
    expect(arg.text).to.eql('task name');
    expect(arg.icon).to.eql(false);
  });

  it('does not send text notification if no text is given', function() {
    notification.text();

    expect($.pnotify).to.not.have.been.called;
  });
});
