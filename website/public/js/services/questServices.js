'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Quests', questsFactory);

  questsFactory.$inject = [
    '$rootScope',
    'Content',
    'Groups',
    'User',
    'Analytics'
  ];

  function questsFactory($rootScope,Content,Groups,User,Analytics) {

    var user = User.user;
    var party = Groups.party();

    function lockQuest(quest,ignoreLevel) {
      if (!ignoreLevel){
        if (quest.lvl && user.stats.lvl < quest.lvl) return true;
      }
      if (user.achievements.quests) return (quest.previous && !user.achievements.quests[quest.previous]);
      return (quest.previous);
    }

    function buyQuest(quest) {
      var item = Content.quests[quest];

      if (item.unlockCondition && item.unlockCondition.condition === 'party invite') {
        if (!confirm(window.env.t('mustInviteFriend'))) return;
        return Groups.inviteOrStartParty(party);
      }
      if (item.previous && (!User.user.achievements.quests || (User.user.achievements.quests && !User.user.achievements.quests[item.previous]))){
        return alert(window.env.t('unlockByQuesting', {title: Content.quests[item.previous].text()}));
      }
      if (item.lvl && item.lvl > user.stats.lvl) {
        return alert(window.env.t('mustLvlQuest', {level: item.lvl}));
      }
      $rootScope.selectedQuest = item;
      $rootScope.openModal('buyQuest', {controller:'InventoryCtrl'});
    }

    function questPopover(quest) {
      // The popover gets parsed as markdown (hence the double \n for line breaks
      var text = '';
      if(quest.boss) {
        text += '**' + window.env.t('bossHP') + ':** ' + quest.boss.hp + '\n\n';
        text += '**' + window.env.t('bossStrength') + ':** ' + quest.boss.str + '\n\n';
      } else if(quest.collect) {
        var count = 0;
        for (var key in quest.collect) {
          text += '**' + window.env.t('collect') + ':** ' + quest.collect[key].count + ' ' + quest.collect[key].text() + '\n\n';
        }
      }
      text += '---\n\n';
      text += '**' + window.env.t('rewards') + ':**\n\n';
      if(quest.drop.items) {
        for (var item in quest.drop.items) {
          text += quest.drop.items[item].text() + '\n\n';
        }
      }
      if(quest.drop.exp)
        text += quest.drop.exp + ' ' + window.env.t('experience') + '\n\n';
      if(quest.drop.gp)
        text += quest.drop.gp + ' ' + window.env.t('gold') + '\n\n';

      return text;
    }

    function showQuest(quest) {
      var item =  Content.quests[quest];
      var completedPrevious = !item.previous || (User.user.achievements.quests && User.user.achievements.quests[item.previous]);
      if (!completedPrevious)
        return alert(window.env.t('mustComplete', {quest: $rootScope.Content.quests[item.previous].text()}));
      if (item.lvl && item.lvl > user.stats.lvl)
        return alert(window.env.t('mustLevel', {level: item.lvl}));
      $rootScope.selectedQuest = item;
      $rootScope.openModal('showQuest', {controller:'InventoryCtrl'});
    }

    function closeQuest(){
      $rootScope.selectedQuest = undefined;
    }

    function questInit(){
      Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'quest','owner':true,'response':'accept','questName':$rootScope.selectedQuest.key});
      Analytics.updateUser({'partyID':party._id,'partySize':party.memberCount});
      party.$questAccept({key:$rootScope.selectedQuest.key}, function(){
        party.$get();
        $rootScope.$state.go('options.social.party');
      });
      closeQuest();
    }

    return {
      lockQuest: lockQuest,
      buyQuest: buyQuest,
      questPopover: questPopover,
      showQuest: showQuest,
      closeQuest: closeQuest,
      questInit: questInit
    }
  }
}());
