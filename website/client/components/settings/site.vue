<template lang="pug">
  .row.standard-page
    h1.col-12 {{ $t('settings') }}
    .col-6
      .form-horizontal
        h5 {{ $t('language') }}
        select.form-control(v-model='selectedLanguage',
          @change='changeLanguage()')
          option(v-for='lang in availableLanguages', :value='lang.code') {{lang.name}}

        small
          | {{ $t('americanEnglishGovern') }}
          br
          strong(v-html="$t('helpWithTranslation')")
      hr

      .form-horizontal
        h5 {{ $t('dateFormat') }}
        select.form-control(v-model='user.preferences.dateFormat',
          @change='set({"preferences.dateFormat": user.preferences.dateFormat})')
          option(v-for='dateFormat in availableFormats', :value='dateFormat') {{dateFormat}}
      hr

      div
        .checkbox
          label
            input(type='checkbox', @click='hideHeader() ', v-model='user.preferences.hideHeader')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('showHeaderPop')") {{ $t('showHeader') }}
        .checkbox
          label
            input(type='checkbox', @click='toggleStickyHeader()', v-model='user.preferences.stickyHeader', :disabled="user.preferences.hideHeader")
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('stickyHeaderPop')") {{ $t('stickyHeader') }}
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.newTaskEdit', @click='set("newTaskEdit")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('newTaskEditPop')") {{ $t('newTaskEdit') }}
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.tagsCollapsed', @change='set("tagsCollapsed")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('startCollapsedPop')") {{ $t('startCollapsed') }}
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.advancedCollapsed', @change='set("advancedCollapsed")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('startAdvCollapsedPop')") {{ $t('startAdvCollapsed') }}
        .checkbox
          label
            input(type='checkbox', v-model='user.preferences.dailyDueDefaultView', @change='set("dailyDueDefaultView")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('dailyDueDefaultViewPop')") {{ $t('dailyDueDefaultView') }}
        .checkbox(v-if='party.memberCount === 1')
          label
            input(type='checkbox', v-model='user.preferences.displayInviteToPartyWhenPartyIs1', @change='set("displayInviteToPartyWhenPartyIs1")')
            span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('displayInviteToPartyWhenPartyIs1')") {{ $t('displayInviteToPartyWhenPartyIs1') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.levelUp', @change='set("suppressModals", "levelUp")')
          label {{ $t('suppressLevelUpModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.hatchPet', @change='set("suppressModals", "hatchPet")')
          label {{ $t('suppressHatchPetModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.raisePet', @change='set("suppressModals", "raisePet")')
          label {{ $t('suppressRaisePetModal') }}
        .checkbox
          input(type='checkbox', v-model='user.preferences.suppressModals.streak', @change='set("suppressModals", "streak")')
          label {{ $t('suppressStreakModal') }}
        //- .checkbox
        //-   label {{ $t('confirmScoreNotes') }}
        //-     input(type='checkbox', v-model='user.preferences.tasks.confirmScoreNotes', @change='set({"preferences.tasks.confirmScoreNotes": user.preferences.tasks.confirmScoreNotes ? true: false})')

        //- .checkbox
        //-   label {{ $t('groupTasksByChallenge') }}
        //-     input(type='checkbox', v-model='user.preferences.tasks.groupByChallenge', @change='set({"preferences.tasks.groupByChallenge": user.preferences.tasks.groupByChallenge ? true: false})')

        hr

        button.btn.btn-primary(@click='showBailey()', popover-trigger='mouseenter', popover-placement='right', :popover="$t('showBaileyPop')") {{ $t('showBailey') }}
        button.btn.btn-primary(@click='openRestoreModal()', popover-trigger='mouseenter', popover-placement='right', :popover="$t('fixValPop')") {{ $t('fixVal') }}
        button.btn.btn-primary(v-if='user.preferences.disableClasses == true', @click='changeClass({})',
          popover-trigger='mouseenter', popover-placement='right', :popover="$t('enableClassPop')") {{ $t('enableClass') }}

        hr

        div
          h5 {{ $t('customDayStart') }}
          .alert.alert-warning {{ $t('customDayStartInfo1') }}
          .form-horizontal
            .form-group
              .col-7
                select.form-control(v-model='dayStart')
                  option(v-for='option in dayStartOptions' :value='option.value') {{option.name}}

              .col-5
                button.btn.btn-block.btn-primary(@click='openDayStartModal(dayStart)',
                  :disabled='dayStart == user.preferences.dayStart')
                  | {{ $t('saveCustomDayStart') }}
          hr

        h5 {{ $t('timezone') }}
        .form-horizontal
          .form-group
            .col-12
              p(v-html="$t('timezoneUTC', {utc: timezoneOffsetToUtc})")
              p(v-html="$t('timezoneInfo')")

    .col-6
      h2 {{ $t('registration') }}
      .panel-body
        div
          ul.list-inline
            li(v-for='network in SOCIAL_AUTH_NETWORKS')
              button.btn.btn-primary(v-if='!user.auth[network.key].id', @click='socialLogin(network.key, user)') {{ $t('registerWithSocial', {network: network.name}) }}
              button.btn.btn-primary(disabled='disabled', v-if='!hasBackupAuthOption(user, network.key) && user.auth[network.key].id') {{ $t('registeredWithSocial', {network: network.name}) }}
              button.btn.btn-danger(@click='deleteSocialAuth(network.key)', v-if='hasBackupAuthOption(user, network.key) && user.auth[network.key].id') {{ $t('detachSocial', {network: network.name}) }}
          hr
          div(v-if='!user.auth.local.username')
            p {{ $t('addLocalAuth') }}
            form(ng-submit='http("post", "/api/v3/user/auth/local/register", localAuth, "addedLocalAuth")', ng-init='localAuth={}', name='localAuth', novalidate)
              //-.alert.alert-danger(ng-messages='changeUsername.$error && changeUsername.submitted') {{ $t('fillAll') }}
              .form-group
                input.form-control(type='text', placeholder {{ $t('username') }}, v-model='localAuth.username', required)
              .form-group
                input.form-control(type='text', placeholder {{ $t('email') }}, v-model='localAuth.email', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('password') }}, v-model='localAuth.password', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('confirmPass') }}, v-model='localAuth.confirmPassword', required)
              button.btn.btn-primary(type='submit', ng-disabled='localAuth.$invalid', value {{ $t('submit') }})

        .usersettings(v-if='user.auth.local.username')
          p {{ $t('username') }}
            |: {{user.auth.local.username}}
          p
            small.muted
                | {{ $t('loginNameDescription1') }}
                |&nbsp;
                a(href='/#/options/profile/profile') {{ $t('loginNameDescription2') }}
                |&nbsp;
                | {{ $t('loginNameDescription3') }}
          p {{ $t('email') }}
            |: {{user.auth.local.email}}
          hr

          h5 {{ $t('changeUsername') }}
          .form(v-if='user.auth.local', name='changeUsername', novalidate)
            //-.alert.alert-danger(ng-messages='changeUsername.$error && changeUsername.submitted') {{ $t('fillAll') }}
            .form-group
              input.form-control(type='text', :placeholder="$t('newUsername')", v-model='usernameUpdates.username', required)
            .form-group
              input.form-control(type='password', :placeholder="$t('password')", v-model='usernameUpdates.password', required)
            button.btn.btn-primary(type='submit', @click='changeUser("username", usernameUpdates)') {{ $t('submit') }}

          h5 {{ $t('changeEmail') }}
          .form(v-if='user.auth.local', name='changeEmail', novalidate)
            .form-group
              input.form-control(type='text', :placeholder="$t('newEmail')", v-model='emailUpdates.newEmail', required)
            .form-group
              input.form-control(type='password', :placeholder="$t('password')", v-model='emailUpdates.password', required)
            button.btn.btn-primary(type='submit', @click='changeUser("email", emailUpdates)') {{ $t('submit') }}

          h5 {{ $t('changePass') }}
          .form(v-if='user.auth.local', name='changePassword', novalidate)
            .form-group
              input.form-control(type='password', :placeholder="$t('oldPass')", v-model='passwordUpdates.password', required)
            .form-group
              input.form-control(type='password', :placeholder="$t('newPass')", v-model='passwordUpdates.newPassword', required)
            .form-group
              input.form-control(type='password', :placeholder="$t('confirmPass')", v-model='passwordUpdates.confirmPassword', required)
            button.btn.btn-primary(type='submit', @click='changeUser("password", passwordUpdates)') {{ $t('submit')  }}


          div
            h5 {{ $t('dangerZone') }}
            div
              button.btn.btn-danger(@click='openModal("reset", {controller:"SettingsCtrl"})',
                popover-trigger='mouseenter', popover-placement='right', popover="$t('resetAccPop')") {{ $t('resetAccount') }}
              button.btn.btn-danger(@click='openModal("delete", {controller:"SettingsCtrl"})',
                popover-trigger='mouseenter', :popover="$t('deleteAccPop')") {{ $t('deleteAccount') }}
</template>

<style scope>
  .usersettings h5 {
    margin-top: 1em;
  }
</style>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';

// @TODO: import
// var SOCIAL_AUTH_NETWORKS = Shared.constants.SUPPORTED_SOCIAL_NETWORKS;
// $scope.SOCIAL_AUTH_NETWORKS = SOCIAL_AUTH_NETWORKS;

export default {
  data () {
    let dayStartOptions = [];
    for (let number = 0; number < 24; number += 1) {
      let meridian = number < 12 ? 'AM' : 'PM';
      let hour = number % 12;
      let option = {
        value: number,
        name: `${hour ? hour : 12}:00 ${meridian}`,
      };
      dayStartOptions.push(option);
    }

    return {
      SOCIAL_AUTH_NETWORKS: [
        {
          name: 'Facebook',
          key: 'facebook',
        },
      ],
      // @TODO: use store
      party: {
        memberCount: 1,
      },
      // @TODO: import
      availableLanguages: [
        {
          code: 'en',
          name: 'English',
        },
      ],
      availableFormats: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'],
      dayStartOptions,
      usernameUpdates: {},
      emailUpdates: {},
      passwordUpdates: {},
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    timezoneOffsetToUtc () {
      return this.user.preferences.timezoneOffset;
    },
    selectedLanguage () {
      return this.user.preferences.language;
    },
    dayStart () {
      return this.user.preferences.dayStart;
    },
  },
  methods: {
    set (preferenceType, notification) {
      let settings = {};
      settings[`preferences.${preferenceType}.${notification}`] = this.user.preferences[preferenceType][notification];
      this.$store.dispatch('user:set', settings);
    },
    hideHeader () {
      this.set({'preferences.hideHeader': !this.user.preferences.hideHeader});
      if (!this.user.preferences.hideHeader || !this.user.preferences.stickyHeader) return;
      this.set({'preferences.stickyHeader': false});

      // @TODO: What to sync?
      // $rootScope.$on('userSynced', function(){
      //   window.location.reload();
      // });
    },
    toggleStickyHeader () {
      // @TODO: What to sync?
      // $rootScope.$on('userSynced', function(){
      //   window.location.reload();
      // });
      this.set({'preferences.stickyHeader': !this.user.preferences.stickyHeader});
    },
    showTour  () {
      // @TODO: Do we still use this?
      // User.set({'flags.showTour':true});
      // Guide.goto('intro', 0, true);
    },
    showBailey () {
      this.set({'flags.newStuff': true});
    },
    hasBackupAuthOption () {
      // if (user.auth.local.username) {
      //   return true;
      // }
      // return _.find(SOCIAL_AUTH_NETWORKS, function (network) {
      //   if (network.key !== checkedNetworkKey) {
      //     if (user.auth.hasOwnProperty(network.key)) {
      //       return user.auth[network.key].id;
      //     }
      //   }
      // });
    },
    openDayStartModal () {
      // $scope.dayStart = +dayStart;
      // $scope.nextCron = _calculateNextCron();
      //
      // $rootScope.openModal('change-day-start', { scope: $scope });
    },
    _calculateNextCron () {
      // $scope.dayStart;
      //
      // var nextCron = moment().hours($scope.dayStart).minutes(0).seconds(0).milliseconds(0);
      //
      // var currentHour = moment().format('H');
      // if (currentHour >= $scope.dayStart) {
      //   nextCron = nextCron.add(1, 'day');;
      // }
      //
      // return +nextCron.format('x');
    },
    // @TODO: I thinnk this goes in the change day start modal?
    // $scope.saveDayStart = function() {
    //   User.setCustomDayStart(Math.floor($scope.dayStart));
    // };
    changeLanguage () {
      // @TODO: What to sync?
      // $rootScope.$on('userSynced', function(){
      //   window.location.reload();
      // });
      this.set({'preferences.language': this.selectedLanguage.code});
    },
    // @TODO: these two were in settings but should be in market
    // $scope.reroll = function(confirm){
    //   $scope.popoverEl.popover('destroy');
    //
    //   if (confirm) {
    //     User.reroll({});
    //     $rootScope.$state.go('tasks');
    //   }
    // }
    //
    // $scope.clickReroll = function($event){
    //   $scope.popoverEl = $($event.target);
    //
    //   var html = $compile(
    //       '<a ng-controller="SettingsCtrl" ng-click="$close(); reroll(true)">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="reroll(false)">' + window.env.t('cancel') + '</a><br/>'
    //   )($scope);
    //
    //   $scope.popoverEl.popover('destroy').popover({
    //     html: true,
    //     placement: 'top',
    //     trigger: 'manual',
    //     title: window.env.t('confirmFortify'),
    //     content: html
    //   }).popover('show');
    // }
    // @TODO: REbirth also needs to be in the market
    // $scope.rebirth = function(confirm){
    //   $scope.popoverEl.popover('destroy');
    //
    //   if (confirm) {
    //     User.rebirth({});
    //     $rootScope.$state.go('tasks');
    //   }
    // }
    //
    // $scope.clickRebirth = function($event){
    //   $scope.popoverEl = $($event.target);
    //
    //   var html = $compile(
    //       '<a ng-controller="SettingsCtrl" ng-click="$close(); rebirth(true)">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="rebirth(false)">' + window.env.t('cancel') + '</a><br/>'
    //   )($scope);
    //
    //   $scope.popoverEl.popover('destroy').popover({
    //     html: true,
    //     placement: 'top',
    //     trigger: 'manual',
    //     title: window.env.t('confirmReborn'),
    //     content: html
    //   }).popover('show');
    // }
    async changeUser (attribute, updates) {
      await axios.put(`/api/v3/user/auth/update-${attribute}`, updates);
      alert(this.$t(`${attribute} Success`));
      // @TODO: Update the user
      // User.sync();
    },
    openRestoreModal () {
      // $scope.restoreValues.stats = angular.copy(User.user.stats);
      // $scope.restoreValues.achievements = {streak: User.user.achievements.streak || 0};
      // $rootScope.openModal('restore', {scope:$scope});
    },
    restore () {
      // var stats = $scope.restoreValues.stats,
      //   achievements = $scope.restoreValues.achievements;
      //
      // if (stats.lvl < 1) {
      //   Notification.error(env.t('invalidLevel'), true);
      //   return;
      // }
      //
      // User.set({
      //   'stats.hp': stats.hp,
      //   'stats.exp': stats.exp,
      //   'stats.gp': stats.gp,
      //   'stats.lvl': stats.lvl,
      //   'stats.mp': stats.mp,
      //   'achievements.streak': achievements.streak
      // });
      // $modalStack.dismissAll();
    },
    // @TODO: reset modal
    reset () {
      // User.reset({});
      // User.sync();
      // $rootScope.$state.go('tasks');
    },
    // @TODO: delete modal
    async delete (password, feedback) {
      await axios.delete('/api/v3/user/', {
        password,
        feedback,
      });
      localStorage.clear();
      this.$router.push('/');
    },
    // @TODO: Release is for the market?
    // $scope.clickRelease = function(type, $event){
    //   // Close other popovers if they're open
    //   $(".release_popover").not($event.target).popover('destroy');
    //
    //   // Handle clicking on the gem icon
    //   if ($event.target.nodeName == "SPAN") {
    //     $scope.releasePopoverEl = $($event.target.parentNode);
    //   } else {
    //     $scope.releasePopoverEl = $($event.target);
    //   }
    //
    //   var html = $compile(
    //       '<a ng-controller="SettingsCtrl" ng-click="$close(); releaseAnimals(\'' + type + '\')">' + window.env.t('confirm') + '</a><br/>\n<a ng-click="releaseAnimals()">' + window.env.t('cancel') + '</a><br/>'
    //   )($scope);
    //
    //   $scope.releasePopoverEl.popover('destroy').popover({
    //     html: true,
    //     placement: 'top',
    //     trigger: 'manual',
    //     title: window.env.t('confirmPetKey'),
    //     content: html
    //   }).popover('show');
    // }
    //
    // $scope.releaseAnimals = function (type) {
    //   $scope.releasePopoverEl.popover('destroy');
    //
    //   var releaseFunction = RELEASE_ANIMAL_TYPES[type];
    //
    //   if (releaseFunction) {
    //     User[releaseFunction]({});
    //     $rootScope.$state.go('tasks');
    //   }
    // }
    // @TODO: I don't think this function is used:
    // $scope.hasSocialAuth = function (user) {
    //   return _.find(SOCIAL_AUTH_NETWORKS, function (network) {
    //     if (user.auth.hasOwnProperty(network.key)) {
    //       return user.auth[network.key].id;
    //     }
    //   });
    // };
    async deleteSocialAuth (networkKey) {
      // @TODO: What do we use this for?
      // let networktoRemove = find(SOCIAL_AUTH_NETWORKS, function (network) {
      //   return network.key === networkKey;
      // });

      await axios.get(`/api/v3/user/auth/social/${networkKey}`);
      // @TODO:
      // Notification.text(env.t("detachedSocial", {network: network.name}));
      // User.sync();
    },
    // @TODO: $scope.socialLogin = Social.socialLogin;
  },
};
</script>
