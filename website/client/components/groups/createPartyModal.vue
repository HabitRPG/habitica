<template lang="pug">
b-modal#create-party-modal(title="Empty", size='lg', hide-footer=true)
  .header-wrap(slot="modal-header")
    .quest_screen
    .row.heading
      .col-12.text-center
        h2(v-once) {{$t('playInPartyTitle')}}
        p(v-once) {{$t('playInPartyDescription')}}
  .row.grey-row
    .col-6.text-center
      .start-party
      h3(v-once) {{$t('startYourOwnPartyTitle')}}
      p(v-once) {{$t('startYourOwnPartyDescription')}}
      button.btn.btn-primary(v-once, @click='createParty()') {{$t('createParty')}}
    .col-6
      div.text-center
        .join-party
        h3(v-once) {{$t('wantToJoinPartyTitle')}}
        p(v-once) {{$t('wantToJoinPartyDescription')}}
        button.btn.btn-primary(v-once, @click='shareUserId()') {{$t('shartUserId')}}
      .share-userid-options(v-if="shareUserIdShown")
        .option-item(v-once)
          .svg-icon(v-html="icons.copy")
          | Copy User ID
        .option-item(v-once)
          .svg-icon(v-html="icons.greyBadge")
          | {{$t('lookingForGroup')}}
        .option-item(v-once)
          .svg-icon(v-html="icons.qrCode")
          | {{$t('qrCode')}}
        .option-item(v-once)
          .svg-icon.facebook(v-html="icons.facebook")
          | Facebook
        .option-item(v-once)
          .svg-icon(v-html="icons.twitter")
          | Twitter
</template>

<style>
  #create-party-modal .modal-dialog {
    width: 684px;
  }

  #create-party-modal .modal-header {
    padding: 0;
  }
</style>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  .heading {
    margin-top: 1em;
    margin-bottom: 1em;
  }

  .header-wrap {
    padding: 0;
    color: #4e4a57;
    width: 100%;

    .quest_screen {
      background-image: url('~client/assets/images/quest_screen.png');
      background-size: cover;
      width: 100%;
      height: 246px;
      margin-bottom: .5em;
      border-radius: 2px 2px 0 0;
    }

    h2 {
      color: #4f2a93;
    }
  }

  .start-party {
    background-image: url('~client/assets/images/basilist@3x.png');
    background-size: cover;
    width: 122px;
    height: 69px;
    margin: 0 auto;
    margin-bottom: 1em;
  }

  .join-party {
    background-image: url('~client/assets/images/party@3x.png');
    background-size: cover;
    width: 203px;
    height: 66px;
    margin: 0 auto;
    margin-bottom: 1em;
  }

  .modal-body {
    padding-bottom: 0;
    padding-top: 0;
  }

  .grey-row {
    background-color: $gray-700;
    color: #4e4a57;
    padding: 2em;
    border-radius: 0px 0px 2px 2px;
  }

  .share-userid-options {
    background-color: $white;
    border-radius: 2px;
    width: 220px;
    position: absolute;
    top: -8em;
    left: 4.8em;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);

    .option-item {
      padding: 1em;

      .svg-icon {
        margin-right: .5em;
        width: 20px;
        display: inline-block;
        vertical-align: bottom;
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
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';

import copyIcon from 'assets/svg/copy.svg';
import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import qrCodeIcon from 'assets/svg/qrCode.svg';
import facebookIcon from 'assets/svg/facebook.svg';
import twitterIcon from 'assets/svg/twitter.svg';

export default {
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
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    shareUserId () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Health Warning',
      });
      this.shareUserIdShown = !this.shareUserIdShown;
    },
    async createParty () {
      let group = {
        type: 'party',
      };
      group.name = this.$t('possessiveParty', {name: this.user.profile.name});
      let party = await this.$store.dispatch('guilds:create', {group});
      this.$store.state.party.data = party;
      this.user.party._id = party._id;

      Analytics.updateUser({
        partyID: party._id,
        partySize: 1,
      });

      this.$root.$emit('bv::hide::modal', 'create-party-modal');
      this.$router.push('/party');
    },
  },
};
</script>
