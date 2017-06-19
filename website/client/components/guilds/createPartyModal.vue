<template lang="pug">
b-modal#create-party-modal(title="Empty", size='lg', hide-footer=true)
  .header-wrap(slot="modal-header")
    h2 Image Here
    .row
      .col-12.text-center
        h2(v-once) {{$t('playInPartyTitle')}}
        p(v-once) {{$t('playInPartyDescription')}}
  .row.grey-row
    .col-6.text-center
      img
      h3(v-once) {{$t('startYourOwnPartyTitle')}}
      p(v-once) {{$t('startYourOwnPartyDescription')}}
      button.btn.btn-primary(v-once) {{$t('createParty')}}
    .col-6
      div.text-center
        img
        h3(v-once) {{$t('wantToJoinPartyTitle')}}
        p(v-once) {{$t('wantToJoinPartyDescription')}}
        button.btn.btn-primary(v-once, @click='shareUserIdShown = !shareUserIdShown') {{$t('shartUserId')}}
      .share-userid-options(v-if="shareUserIdShown")
        .option-item(v-once)
          .svg-icon(v-html="icons.copy")
          | {{$t('copy')}}
        .option-item(v-once)
          .svg-icon(v-html="icons.greyBadge")
          | {{$t('lookingForGroup')}}
        .option-item(v-once)
          .svg-icon(v-html="icons.qrCode")
          | {{$t('qrCode')}}
        .option-item(v-once)
          .svg-icon.facebook(v-html="icons.facebook")
          | {{$t('facebook')}}
        .option-item(v-once)
          .svg-icon(v-html="icons.twitter")
          | {{$t('twitter')}}
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  .modal-body {
    padding-bottom: 0;
    padding-top: 0;
  }

  .grey-row {
    background-color: $gray-700;
    padding: 2em;
    border-radius: 0px 0px 2px 2px;
  }

  .share-userid-options {
    background-color: $white;
    border-radius: 2px;
    width: 180px;
    position: absolute;
    top: -8em;
    left: 4.8em;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);

    .option-item {
      padding: 1em;

      .svg-icon {
        margin-right: .5em;
      }

      .facebook svg {
        width: 15px;
        height: 15px;
      }
    }

    .option-item:hover {
      background-color: $header-color;
      color: $purple-200;
      cursor: pointer;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import copyIcon from 'assets/svg/copy.svg';
import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import qrCodeIcon from 'assets/svg/qrCode.svg';
import facebookIcon from 'assets/svg/facebook.svg';
import twitterIcon from 'assets/svg/twitter.svg';

export default {
  components: {
    bModal,
  },
  data () {
    return {
      icons: Object.freeze({
        copy: copyIcon,
        greyBadge: greyBadgeIcon,
        qrCode: qrCodeIcon,
        facebook: facebookIcon,
        twitter: twitterIcon,
      }),
      shareUserIdShown: false,
    };
  },
  methods: {
    createParty () {
      // group.loadingParty = true;
      //
      // if (!group.name) group.name = env.t('possessiveParty', {name: User.user.profile.name});
      // Groups.Group.create(group)
      //   .then(function(response) {
      //     Analytics.updateUser({'partyID': $scope.group ._id, 'partySize': 1});
      //     $rootScope.hardRedirect('/#/options/groups/party');
      //   });
    },
  },
};
</script>
