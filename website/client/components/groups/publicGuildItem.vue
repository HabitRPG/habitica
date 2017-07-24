<template lang="pug">
.card
  .card-block
    .row
      .col-md-2
        .svg-icon.shield(v-html="icons.goldGuildBadge")
        .member-count {{guild.memberCount}}
      .col-md-10
        .row
          .col-md-8
              router-link(:to="{ name: 'guild', params: { guildId: guild._id } }")
                h3 {{ guild.name }}
              p {{ guild.description }}
          .col-md-2.cta-container
            button.btn.btn-danger(v-if='isMember && displayLeave' @click='leave()', v-once) {{ $t('leave') }}
            button.btn.btn-success(v-if='!isMember'  @click='join()', v-once) {{ $t('join') }}
            div.item-with-icon(v-if='displayGemBank')
              .svg-icon(v-html="icons.gem")
              span.count {{ guild.balance }}
            div.guild-bank(v-if='displayGemBank', v-once) {{$t('guildBank')}}
        .row
          .col-md-12
            .category-label(v-for="category in guild.categories")
              | {{category}}
            span.recommend-text Suggested because you’re new to Habitica.
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.card {
  height: 260px;
  border-radius: 4px;
  background-color: $white;
  box-shadow: 0 2px 2px 0 rgba($black, 0.15), 0 1px 4px 0 rgba($black, 0.1);
  margin-bottom: 1rem;

  .recommend-text {
    font-size: 12px;
    font-style: italic;
    line-height: 2;
    color: $gray-300;
  }

  .cta-container {
    margin: 0 auto;
    margin-top: 4em;
  }

  .item-with-icon {
    .svg-icon {
      height: 37px;
    }

    .count {
      font-size: 20px;
      height: 37px;
      width: 37px;
      margin-left: .2em;
    }
  }

  .shield {
    width: 70px;
  }

  .guild-bank {
    font-size: 12px;
    line-height: 1.33;
    color: $gray-300;
  }

  .member-count {
    position: relative;
    top: -3.6em;
    left: -.1em;
    font-size: 28px;
    font-weight: bold;
    font-family: 'Roboto Condensed';
    line-height: 1.2;
    text-align: center;
    color: #b36213;
  }
}
</style>

<script>
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';
import findIndex from 'lodash/findIndex';
import gemIcon from 'assets/svg/gem.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge.svg';

export default {
  mixins: [groupUtilities],
  props: ['guild', 'displayLeave', 'displayGemBank'],
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gem: gemIcon,
        goldGuildBadge: goldGuildBadgeIcon,
      }),
    };
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
