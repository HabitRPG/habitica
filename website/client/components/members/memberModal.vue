<template lang="pug">
  b-modal#member-detail-modal(title="Empty", size='lg')
    .modal-header
      h4
        span {{profile.profile.name}}
        span(v-if='contribText && profile.contributor.level')  - {{contribText(profile.contributor, profile.backer)}}
    .modal-body
      .container-fluid
        .row
          .col-md-6
            img.img-renderiv-auto(v-if='profile.profile.imageUrl', :src='profile.profile.imageUrl')
            markdown(v-if='profile.profile.blurb', text='profile.profile.blurb')
            ul.muted.list-unstyled(v-if='profile.auth.timestamps')
              li {{profile._id}}
              li(v-if='profile.auth.timestamps.created')
                |&nbsp;
                | {{ $t('memberSince') }}
                |&nbsp;
                | {{profile.auth.timestamps.created | date:user.preferences.dateFormat}} -
              li(v-if='profile.auth.timestamps.loggedin')
               |&nbsp;
               | {{ $t('lastLoggedIn') }}
               |&nbsp;
               | {{profile.auth.timestamps.loggedin | date:user.preferences.dateFormat}} -
            h3 {{ $t('stats') }}
            // @TODO: Figure out why this isn't showing up in front page
            .label.label-info {{ {warrior:env.t("warrior"), wizard:env.t("mage"), rogue:env.t("rogue"), healer:env.t("healer")}[profile.stats.class] }}
            // include ../profiles/stats_all
          .col-md-6
            .row
              //@TODO: +herobox()
            .row
              h3 {{ $t('achievements') }}
              //include ../profiles/achievements
    .modal-footer
      .btn-group.pull-left(v-if='user')
        button.btn.btn-md.btn-default(v-if='user.inbox.blocks.indexOf(profile._id) !== -1', :tooltip="$t('unblock')", @click="User.blockUser({params:{uuid:profile._id}})", tooltip-placement='right')
          span.glyphicon.glyphicon-plus
        button.btn.btn-md.btn-default(v-if='profile._id != user._id && !profile.contributor.admin && !(user.inbox.blocks | contains:profile._id)', tooltip {{ $t('block') }}, @click="User.blockUser({params:{uuid:profile._id}})", tooltip-placement='right')
          span.glyphicon.glyphicon-ban-circle
        button.btn.btn-md.btn-default(:tooltip="$t('sendPM')", @click="openModal('private-message',{controller:'MemberModalCtrl'})", tooltip-placement='right')
          span.glyphicon.glyphicon-envelope
        button.btn.btn-md.btn-default(:tooltip="$t('sendGift')", @click="openModal('send-gift',{controller:'MemberModalCtrl'})", tooltip-placement='right')
          span.glyphicon.glyphicon-gift
      button.btn.btn-default(@click='close()') {{ $t('close') }}
</template>

<script>
import { mapState } from 'client/libs/store';

import moment from 'moment';
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  // @TODO: We should probably use a store. Only view one member at a time?
  props: ['profile'],
  data () {
    return {
      //  @TODO: We don't send subscriptions so the structure has changed in the back. Update this when we update the views.
      gift: {
        type: 'gems',
        gems: {amount: 0, fromBalance: true},
        subscription: {key: ''},
        message: '',
      },
    };
  },
  components: {
    bModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  mounted () {
    // @TODO: This.$store.selectmember
    // if (member) {
    //   this.profile = member;
    //
    //   this.achievements = Shared.achievements.getAchievementsForProfile(this.profile);
    //   this.achievPopoverPlacement = 'left';
    //   this.achievAppendToBody = 'false'; // append-to-body breaks popovers in modal windows
    // }
  },
  methods: {
    timestamp (timestamp) {
      return moment(timestamp).format(this.user.preferences.dateFormat.toUpperCase());
    },
    // @TODO: create mixin for stats: this.statCalc = Stats;
    // @TODO: create mixin or library for constume functions this.costume = Costume;
    keyDownListener  (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        this.sendPrivateMessage(this.profile._id, this._message);
      }
    },
    // @TODO: Inbox?
    sendPrivateMessage (uuid, message) {
      if (!message) return;

      // Members.sendPrivateMessage(message, uuid)
      //   .then(function (response) {
      //     Notification.text(window.env.t('messageSentAlert'));
      //     $rootScope.User.sync();
      //     this.$close();
      //   });
    },
    async sendGift (uuid) {
      await this.$store.dispatch('members:transferGems', {
        message: this.gift.message,
        toUserId: uuid,
        gemAmount: this.gift.gems.amount,
      });

      // @TODO: Notification.text(this.$t('sentGems'));
      // @TODO: What needs to be synced? $rootScope.User.sync();
      this.close();
    },
    async reportAbuse (reporter, message, groupId) {
      let response = await this.$store.dispatch('chat:flag', {
        groupId,
        chatId: message.id,
      });

      message.flags = response.flags;
      message.flagCount = response.flagCount;
      // @TODO: Notification.text(this.$t('abuseReported'));
      this.close();
    },
    async clearFlagCount (message, groupId) {
      await this.$store.dispatch('chat:clearFlagCount', {
        groupId,
        chatId: message.id,
      });

      message.flagCount = 0;
      // @TODO: Notification.text("Flags cleared");
      this.close();
    },
    close () {
      this.$root.$emit('hide::modal', 'member-detail-modal');
    },
  },
};
</script>
