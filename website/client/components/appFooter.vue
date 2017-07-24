<template lang="pug">
.row
  footer.container-fluid
    .row
      .col-2
        h3 iOS App
        h3 Android App
      .col-2
        h3 Company
        ul
          li How it Works
          li Blog
          li Tumblr
          li FAQ
          li News
          li Merchandis
          li Press Kit
          li Contact Us
      .col-2
        h3 Community
        ul
          li Community Guidelines
          li Submit a Bug
          li Request a Feature
          li Add-Ons & Extensions
          li Forum
          li Kickstarter
          li Facebook
          li Reddit
      .col-6
        .row
          .col-6
            h3 Developers
            ul
              li APIv3
              li Data Display Tool
              li Guidance for Blacksmiths
              li The Forge - Developer Blog
          .col-6
            h3 Social
            .social-circle Twitter
            .social-circle Instagram
            .social-circle Facebook
        .row
          .col-10
            | We’re an open source project that depends on our users for support. The money you donate helps us keep the servers running, maintain a small staff, develop new features, and provide incentives for our volunteers.
          .col-2
            button.btn.btn-primary Donate
    .row
      hr.col-12
    .row
      .col-4
        | © 2017 Habitica. All rights reserved.
      .col-4.text-center
        .logo.svg-icon(v-html='icons.gryphon')
      .col-4.text-right
        span Privacy Policy
        span Terms of Use
</template>

<style scoped>
  footer {
    background-color: #e1e0e3;
    height: 376px;
    padding-left: 6em;
    padding-right: 6em;
    padding-top: 3em;
    margin: 0;
    color: #878190;
  }

  h3 {
    color: #878190;
  }

  ul {
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-bottom: .5em;
  }

  .social-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #c3c0c7;
    display: inline-block;
    margin-right: 1em;
  }

  .logo.svg-icon {
    width: 24px;
    margin: 0 auto;
    color: #c3c0c7;
  }
</style>

<script>
import gryphon from 'assets/svg/gryphon.svg';

// const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env

export default {
  data () {
    return {
      icons: Object.freeze({
        gryphon,
      }),
    };
  },
  methods: {
    // @TODO: add https://github.com/HabitRPG/habitica/blob/develop/website/client-old/js/controllers/footerCtrl.js$scope.setHealthLow = function(){
  //   $scope.setHealthLow = function(){
  //     User.set({
  //       'stats.hp': 1
  //     });
  //   };
  //
  //   $scope.addMissedDay = function(numberOfDays){
  //     if (!confirm("Are you sure you want to reset the day by " + numberOfDays + " day(s)?")) return;
  //
  //     User.setCron(numberOfDays);
  //   };
  //
  //   $scope.addTenGems = function(){
  //     User.addTenGems();
  //   };
  //
  //   $scope.addHourglass = function(){
  //     User.addHourglass();
  //   };
  //
  //   $scope.addGold = function(){
  //     User.set({
  //       'stats.gp': User.user.stats.gp + 500,
  //     });
  //   };
  //
  //   $scope.addMana = function(){
  //     User.set({
  //       'stats.mp': User.user.stats.mp + 500,
  //     });
  //   };
  //
  //   $scope.addLevelsAndGold = function(){
  //     User.set({
  //       'stats.exp': User.user.stats.exp + 10000,
  //       'stats.gp':  User.user.stats.gp  + 10000,
  //       'stats.mp':  User.user.stats.mp  + 10000
  //     });
  //   };
  //
  //   $scope.addOneLevel = function(){
  //     User.set({
  //       'stats.exp': User.user.stats.exp + (Math.round(((Math.pow(User.user.stats.lvl, 2) * 0.25) + (10 * User.user.stats.lvl) + 139.75) / 10) * 10)
  //     });
  //   };
  //
  //   $scope.addQuestProgress = function(){
  //     $http({
  //       method: "POST",
  //       url: 'api/v3/debug/quest-progress'
  //     })
  //     .then(function (response) {
  //       Notification.text('Quest progress increased');
  //       User.sync();
  //     })
  //   };
  //
  //   $scope.makeAdmin = function () {
  //     User.makeAdmin();
  //   };
  //
  //   $scope.openModifyInventoryModal = function () {
  //     $rootScope.openModal('modify-inventory', {controller: 'FooterCtrl', scope: $scope });
  //     $scope.showInv = { };
  //     $scope.inv = {
  //       gear: {},
  //       special: {},
  //       pets: {},
  //       mounts: {},
  //       eggs: {},
  //       hatchingPotions: {},
  //       food: {},
  //       quests: {},
  //     };
  //     $scope.setAllItems = function (type, value) {
  //       var set = $scope.inv[type];
  //
  //       for (var item in set) {
  //         if (set.hasOwnProperty(item)) {
  //           set[item] = value;
  //         }
  //       }
  //     };
  //   };
  //
  //   $scope.modifyInventory = function () {
  //     $http({
  //       method: "POST",
  //       url: 'api/v3/debug/modify-inventory',
  //       data: {
  //         gear: $scope.showInv.gear ? $scope.inv.gear : null,
  //         special: $scope.showInv.special ? $scope.inv.special : null,
  //         pets: $scope.showInv.pets ? $scope.inv.pets : null,
  //         mounts: $scope.showInv.mounts ? $scope.inv.mounts : null,
  //         eggs: $scope.showInv.eggs ? $scope.inv.eggs : null,
  //         hatchingPotions: $scope.showInv.hatchingPotions ? $scope.inv.hatchingPotions : null,
  //         food: $scope.showInv.food ? $scope.inv.food : null,
  //         quests: $scope.showInv.quests ? $scope.inv.quests : null,
  //       }
  //     })
  //     .then(function (response) {
  //       Notification.text('Inventory updated. Refresh or sync.');
  //     })
  //   };
  // }
  },
};
</script>
