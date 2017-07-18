<template lang="pug">
  .row
    .personal-options.col-md-6
      .panel.panel-default
        .panel-heading
          | {{ $t('settings') }}
        .panel-body

          .form-horizontal
            h5 {{ $t('language') }}
            select.form-control(ng-model='language.code', ng-options='lang.code as lang.name for lang in availableLanguages', ng-change='changeLanguage()')
            small
              | {{ $t('americanEnglishGovern') }}
              br
              strong
              | {{ $t('helpWithTranslation') }}

          hr

          .form-horizontal
            h5 {{ $t('dateFormat') }}
            select.form-control(ng-model='user.preferences.dateFormat', ng-options='DF for DF in availableFormats', ng-change='set({"preferences.dateFormat": user.preferences.dateFormat})')

          hr

          .checkbox
            label
              input(type='checkbox', ng-click='hideHeader() ', ng-checked='user.preferences.hideHeader!==true')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('showHeaderPop') }}) {{ $t('showHeader') }}
          .checkbox
            label
              input(type='checkbox', ng-click='toggleStickyHeader()', ng-checked='user.preferences.stickyHeader!==false', ng-disabled="user.preferences.hideHeader!==false")
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('stickyHeaderPop') }}) {{ $t('stickyHeader') }}
          .checkbox
            label
              input(type='checkbox', ng-model='user.preferences.newTaskEdit', ng-change='set({"preferences.newTaskEdit": user.preferences.newTaskEdit?true: false})')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('newTaskEditPop') }}) {{ $t('newTaskEdit') }}
          .checkbox
            label
              input(type='checkbox', ng-model='user.preferences.tagsCollapsed', ng-change='set({"preferences.tagsCollapsed": user.preferences.tagsCollapsed?true: false})')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('startCollapsedPop') }}) {{ $t('startCollapsed') }}
          .checkbox
            label
              input(type='checkbox', ng-model='user.preferences.advancedCollapsed', ng-change='set({"preferences.advancedCollapsed": user.preferences.advancedCollapsed?true: false})')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('startAdvCollapsedPop') }}) {{ $t('startAdvCollapsed') }}
          .checkbox
            label
              input(type='checkbox', ng-model='user.preferences.dailyDueDefaultView', ng-change='set({"preferences.dailyDueDefaultView": user.preferences.dailyDueDefaultView?true: false})')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('dailyDueDefaultViewPop') }}) {{ $t('dailyDueDefaultView') }}
          .checkbox(ng-if='party.memberCount === 1')
            label
              input(type='checkbox', ng-model='user.preferences.displayInviteToPartyWhenPartyIs1', ng-change='set({"preferences.displayInviteToPartyWhenPartyIs1": user.preferences.displayInviteToPartyWhenPartyIs1 ? true : false})')
              span.hint(popover-trigger='mouseenter', popover-placement='right', popover {{ $t('displayInviteToPartyWhenPartyIs1') }}) {{ $t('displayInviteToPartyWhenPartyIs1') }}
          .checkbox
            label {{ $t('suppressLevelUpModal') }}
              input(type='checkbox', ng-model='user.preferences.suppressModals.levelUp', ng-change='set({"preferences.suppressModals.levelUp": user.preferences.suppressModals.levelUp?true: false})')
          .checkbox
            label {{ $t('suppressHatchPetModal') }}
              input(type='checkbox', ng-model='user.preferences.suppressModals.hatchPet', ng-change='set({"preferences.suppressModals.hatchPet": user.preferences.suppressModals.hatchPet?true: false})')
          .checkbox
            label {{ $t('suppressRaisePetModal') }}
              input(type='checkbox', ng-model='user.preferences.suppressModals.raisePet', ng-change='set({"preferences.suppressModals.raisePet": user.preferences.suppressModals.raisePet?true: false})')
          .checkbox
            label {{ $t('suppressStreakModal') }}
              input(type='checkbox', ng-model='user.preferences.suppressModals.streak', ng-change='set({"preferences.suppressModals.streak": user.preferences.suppressModals.streak?true: false})')
          //- .checkbox
          //-   label {{ $t('confirmScoreNotes') }}
          //-     input(type='checkbox', ng-model='user.preferences.tasks.confirmScoreNotes', ng-change='set({"preferences.tasks.confirmScoreNotes": user.preferences.tasks.confirmScoreNotes ? true: false})')

          //- .checkbox
          //-   label {{ $t('groupTasksByChallenge') }}
          //-     input(type='checkbox', ng-model='user.preferences.tasks.groupByChallenge', ng-change='set({"preferences.tasks.groupByChallenge": user.preferences.tasks.groupByChallenge ? true: false})')

          hr

          button.btn.btn-default(ng-click='showBailey()', popover-trigger='mouseenter', popover-placement='right', popover {{ $t('showBaileyPop') }}) {{ $t('showBailey') }}
          button.btn.btn-default(ng-click='openRestoreModal()', popover-trigger='mouseenter', popover-placement='right', popover {{ $t('fixValPop') }}) {{ $t('fixVal') }}
          button.btn.btn-default(ng-if='user.preferences.disableClasses==true', ng-click='User.changeClass({})', popover-trigger='mouseenter', popover-placement='right', popover {{ $t('enableClassPop') }}) {{ $t('enableClass') }}

          hr

          h5 {{ $t('customDayStart') }}
          alert.alert-warning {{ $t('customDayStartInfo1') }}

          .form-horizontal
            .form-group
              .col-sm-7
                select.form-control(ng-model='dayStart')
                  - var number = 0
                  while number < 24
                    - var value = number
                    - var meridian = number < 12 ? 'AM' : 'PM'
                    - var hour = number++ % 12
                    option(value=value) #{hour ? hour : 12}:00 #{meridian}

              .col-sm-5
                br.visible-xs
                button.btn.btn-block.btn-primary(ng-click='openDayStartModal(dayStart)',
                  ng-disabled='dayStart == user.preferences.dayStart')
                  | {{ $t('saveCustomDayStart') }}

          hr

          h5 {{ $t('timezone') }}
          .form-horizontal
            .form-group
              .col-sm-12
                p {{ $t('timezoneUTC', {utc: "user.preferences.timezoneOffset | timezoneOffsetToUtc"}) }}
                br
                p {{ $t('timezoneInfo') }}

    .personal-options.col-md-6
      .panel.panel-default
        .panel-heading
          span {{ $t('registration') }}
        .panel-body
          div
            ul.list-inline
              li(ng-repeat='network in SOCIAL_AUTH_NETWORKS')
                button.btn.btn-primary(ng-if='!user.auth[network.key].id', ng-click='socialLogin(network.key, user)') {{ $t('registerWithSocial', {network: network.name}) }}
                button.btn.btn-primary(disabled='disabled', ng-if='!hasBackupAuthOption(user, network.key) && user.auth[network.key].id') {{ $t('registeredWithSocial', {network: network.name}) }}
                button.btn.btn-danger(ng-click='deleteSocialAuth(network.key)', ng-if='hasBackupAuthOption(user, network.key) && user.auth[network.key].id') {{ $t('detachSocial', {network: network.name}) }}
            hr
            div(ng-if='!user.auth.local.username')
              p {{ $t('addLocalAuth') }}
              form(ng-submit='http("post", "/api/v3/user/auth/local/register", localAuth, "addedLocalAuth")', ng-init='localAuth={}', name='localAuth', novalidate)
                //-.alert.alert-danger(ng-messages='changeUsername.$error && changeUsername.submitted') {{ $t('fillAll') }}
                .form-group
                  input.form-control(type='text', placeholder {{ $t('username') }}, ng-model='localAuth.username', required)
                .form-group
                  input.form-control(type='text', placeholder {{ $t('email') }}, ng-model='localAuth.email', required)
                .form-group
                  input.form-control(type='password', placeholder {{ $t('password') }}, ng-model='localAuth.password', required)
                .form-group
                  input.form-control(type='password', placeholder {{ $t('confirmPass') }}, ng-model='localAuth.confirmPassword', required)
                input.btn.btn-default(type='submit', ng-disabled='localAuth.$invalid', value {{ $t('submit') }})

          div(ng-if='user.auth.local.username')
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
            form(ng-submit='changeUser("username", usernameUpdates)', ng-init='usernameUpdates={}', ng-show='user.auth.local', name='changeUsername', novalidate)
              //-.alert.alert-danger(ng-messages='changeUsername.$error && changeUsername.submitted') {{ $t('fillAll') }}
              .form-group
                input.form-control(type='text', placeholder {{ $t('newUsername') }}, ng-model='usernameUpdates.username', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('password') }}, ng-model='usernameUpdates.password', required)
              input.btn.btn-default(type='submit', ng-disabled='changeUsername.$invalid', value {{ $t('submit') }})

            h5 {{ $t('changeEmail') }}
            form(ng-submit='changeUser("email", emailUpdates)', ng-show='user.auth.local', name='changeEmail', novalidate)
              .form-group
                input.form-control(type='text', placeholder {{ $t('newEmail') }}, ng-model='emailUpdates.newEmail', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('password') }}, ng-model='emailUpdates.password', required)
              input.btn.btn-default(type='submit', ng-disabled='changeEmail.$invalid', value {{ $t('submit') }})

            h5 {{ $t('changePass') }}
            form(ng-submit='changeUser("password", passwordUpdates)', ng-show='user.auth.local', name='changePassword', novalidate)
              .form-group
                input.form-control(type='password', placeholder {{ $t('oldPass') }}, ng-model='passwordUpdates.password', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('newPass') }}, ng-model='passwordUpdates.newPassword', required)
              .form-group
                input.form-control(type='password', placeholder {{ $t('confirmPass') }}, ng-model='passwordUpdates.confirmPassword', required)
              input.btn.btn-default(type='submit', ng-disabled='changePassword.$invalid', value {{ $t('submit') }})


      .panel.panel-default
        .panel-heading
          span {{ $t('dangerZone') }}
        .panel-body
          a.btn.btn-danger(ng-click='openModal("reset", {controller:"SettingsCtrl"})', popover-trigger='mouseenter', popover-placement='right', popover {{ $t('resetAccPop') }}) {{ $t('resetAccount') }}
          a.btn.btn-danger(ng-click='openModal("delete", {controller:"SettingsCtrl"})', popover-trigger='mouseenter', popover {{ $t('deleteAccPop') }}) {{ $t('deleteAccount') }}
</template>
