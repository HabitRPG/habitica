<template lang="pug">
.card
  .card-block
    .row
      .col-md-2
        img.icon.shield(src="~assets/guilds/gold-guild-badge.svg")
      .col-md-10
        .row
          .col-md-8
              router-link(:to="{ name: 'guild', params: { guildId: guild._id } }")
                h3 {{ guild.name }}
              p {{ guild.description }}
          .col-md-2.cta-container
            button.btn.btn-danger(v-if='isMember' @click='leave()') {{ $t('leave') }}
            button.btn.btn-success(v-if='!isMember'  @click='join()') {{ $t('join') }}
        .row
          .col-md-12
            .category-label(v-for="category in guild.categories")
              | {{category}}
            span.recommend-text Suggested because you’re new to Habitica.
</template>

<style lang="scss" scoped>
  .card {
    height: 260px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    margin-bottom: 1rem;

    h3 {
      height: 24px;
      font-size: 16px;
      font-weight: bold;
      font-stretch: condensed;
      line-height: 1.5;
      color: #34313a;
    }

    .category-label {
      min-width: 100px;
      border-radius: 100px;
      background-color: #edecee;
      padding: .5em;
      display: inline-block;
      margin-right: .5em;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.33;
      text-align: center;
      color: #a5a1ac;
    }

    .recommend-text {
      font-size: 12px;
      font-style: italic;
      line-height: 2;
      color: #a5a1ac;
    }

    .btn-success {
      border-radius: 2px;
      background-color: #24cc8f;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
      font-size: 16px;
      font-weight: bold;
      font-stretch: condensed;
      line-height: 1.5;
      text-align: center;
      color: #ffffff;
    }

    .cta-container {
      margin: 0 auto;
      margin-top: 4em;
    }

    .shield {
      width: 70px;
      height: 76px;
      margin: auto;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';
import findIndex from 'lodash/findIndex';

export default {
  mixins: [groupUtilities],
  props: ['guild'],
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  methods: {
    async join () {
      // @TODO: This needs to be in the notifications where users will now accept invites
      if (this.guild.cancelledPlan && !confirm(window.env.t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }
      await this.$store.dispatch('guilds:join', {guildId: this.guild._id, type: 'myGuilds'});
    },
    async leave () {
      // @TODO: ask about challenges when we add challenges
      await this.$store.dispatch('guilds:leave', {guildId: this.guild._id, type: 'myGuilds'});
    },
    async reject (invitationToReject) {
      // @TODO: This needs to be in the notifications where users will now accept invites
      let index = findIndex(this.user.invitations.guilds, function findInviteIndex (invite) {
        return invite.id === invitationToReject.id;
      });
      this.user.invitations.guilds = this.user.invitations.guilds.splice(0, index);
      await this.$store.dispatch('guilds:rejectInvite', {guildId: invitationToReject.id});
    },
  },
};
</script>
