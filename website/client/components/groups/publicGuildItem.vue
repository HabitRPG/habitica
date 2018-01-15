<template lang="pug">
router-link.card-link(:to="{ name: 'guild', params: { groupId: guild._id } }")
  .card
    .card-body
      .row
        .col-md-2.badge-column
          .shield-wrap(:class="{gold: guild.memberCount >= 1000, silver: guild.memberCount >= 100 && guild.memberCount < 1000}")
            .svg-icon.shield(v-html="icons.goldGuildBadge", v-if='guild.memberCount >= 1000')
            .svg-icon.shield(v-html="icons.silverGuildBadgeIcon", v-if='guild.memberCount >= 100 && guild.memberCount < 1000')
            .svg-icon.shield(v-html="icons.bronzeGuildBadgeIcon", v-if='guild.memberCount < 100')
            .member-count {{ guild.memberCount | abbrNum }}
        .col-md-10
          .row
            .col-md-8
                router-link(:to="{ name: 'guild', params: { groupId: guild._id } }")
                  h3 {{ guild.name }}
                p.summary(v-if='guild.summary') {{guild.summary.substr(0, MAX_SUMMARY_SIZE_FOR_GUILDS)}}
                p.summary(v-else) {{ guild.name }}
            .col-md-2.cta-container
              button.btn.btn-danger(v-if='isMember && displayLeave' @click.prevent='leave()', v-once) {{ $t('leave') }}
              button.btn.btn-success(v-if='!isMember'  @click='join()', v-once) {{ $t('join') }}
              div.item-with-icon.gem-bank(v-if='displayGemBank')
                .svg-icon.gem(v-html="icons.gem")
                span.count {{ guild.balance * 4 }}
              div.guild-bank(v-if='displayGemBank', v-once) {{$t('guildBank')}}
          .row
            .col-md-12
              .category-label(v-for="category in guild.categorySlugs")
                | {{$t(category)}}
              span.recommend-text(v-if='showSuggested(guild._id)') Suggested because you’re new to Habitica.
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .card-link {
    color: #4E4A57 !important;
  }

  .card-link:hover {
    text-decoration: none !important;
  }

  .card {
    min-height: 160px;
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

      button {
        margin-top: 2.5em;
      }
    }

    .item-with-icon {
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

    .gold {
      color: #fdbb5a;
    }

    .silver {
      color: #c2c2c2;
    }

    .badge-column {
      display: flex;
      align-items: center;
      justify-content: center;

      .shield-wrap {
        display: inline-block;
        height: 70px;
      }
    }

    .guild-bank {
      font-size: 12px;
      line-height: 1.33;
      color: $gray-300;
    }

    .member-count {
      position: relative;
      top: -3.6em;
      font-size: 22px;
      font-weight: bold;
      line-height: 1.2;
      text-align: center;
      color: #b36213;
      margin-top: 2.1em;
    }

    .gem-bank {
      margin-top: 2em;

      .gem {
        width: 25px;
        display: inline-block;
        vertical-align: bottom;
        margin-right: .8em;
      }
    }
  }
</style>

<script>
import moment from 'moment';
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';
import markdown from 'client/directives/markdown';
import findIndex from 'lodash/findIndex';
import gemIcon from 'assets/svg/gem.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge-large.svg';
import silverGuildBadgeIcon from 'assets/svg/silver-guild-badge-large.svg';
import bronzeGuildBadgeIcon from 'assets/svg/bronze-guild-badge-large.svg';
import { MAX_SUMMARY_SIZE_FOR_GUILDS } from 'common/script/constants';

export default {
  mixins: [groupUtilities],
  directives: {
    markdown,
  },
  props: ['guild', 'displayLeave', 'displayGemBank'],
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  data () {
    return {
      MAX_SUMMARY_SIZE_FOR_GUILDS,
      icons: Object.freeze({
        gem: gemIcon,
        goldGuildBadge: goldGuildBadgeIcon,
        silverGuildBadgeIcon,
        bronzeGuildBadgeIcon,
      }),
    };
  },
  methods: {
    showSuggested (guildId) {
      let habiticaHelpingGuildId = '5481ccf3-5d2d-48a9-a871-70a7380cee5a';
      let createdAfterRedesign = moment(this.user.auth.timestamps.created).isAfter('2017-08-01');
      return guildId === habiticaHelpingGuildId && createdAfterRedesign;
    },
    async join () {
      // @TODO: This needs to be in the notifications where users will now accept invites
      if (this.guild.cancelledPlan && !confirm(window.env.t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }
      await this.$store.dispatch('guilds:join', {guildId: this.guild._id, type: 'myGuilds'});
    },
    async leave () {
      // @TODO: ask about challenges when we add challenges
      await this.$store.dispatch('guilds:leave', {groupId: this.guild._id, type: 'myGuilds'});
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
