<template>
  <router-link
    class="card-link"
    :to="{ name: 'guild', params: { groupId: guild._id } }"
  >
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-2 badge-column">
            <div
              class="shield-wrap"
              :class="{
                gold: guild.memberCount >= 1000,
                silver: guild.memberCount >= 100 && guild.memberCount < 1000}"
            >
              <div
                v-if="guild.memberCount >= 1000"
                class="svg-icon shield"
                v-html="icons.goldGuildBadge"
              ></div>
              <div
                v-if="guild.memberCount >= 100 && guild.memberCount < 1000"
                class="svg-icon shield"
                v-html="icons.silverGuildBadgeIcon"
              ></div>
              <div
                v-if="guild.memberCount < 100"
                class="svg-icon shield"
                v-html="icons.bronzeGuildBadgeIcon"
              ></div>
              <div class="member-count">
                {{ guild.memberCount | abbrNum }}
              </div>
            </div>
          </div>
          <div class="col-md-10">
            <div class="row">
              <div class="col-md-8">
                <router-link :to="{ name: 'guild', params: { groupId: guild._id } }">
                  <h3>{{ guild.name }}</h3>
                </router-link>
                <p
                  v-if="guild.summary"
                  class="summary"
                >
                  {{ guild.summary.substr(0, MAX_SUMMARY_SIZE_FOR_GUILDS) }}
                </p>
                <p
                  v-else
                  class="summary"
                >
                  {{ guild.name }}
                </p>
              </div>
              <div class="col-md-2 cta-container">
                <button
                  v-if="isMember && displayLeave"
                  v-once
                  class="btn btn-danger"
                  @click.prevent="leave()"
                >
                  {{ $t('leave') }}
                </button>
                <button
                  v-if="!isMember"
                  v-once
                  class="btn btn-success"
                  @click="join()"
                >
                  {{ $t('join') }}
                </button>
                <div
                  v-if="displayGemBank"
                  class="item-with-icon gem-bank"
                >
                  <div
                    class="svg-icon gem"
                    v-html="icons.gem"
                  ></div>
                  <span class="count">{{ guild.balance * 4 }}</span>
                </div>
                <div
                  v-if="displayGemBank"
                  v-once
                  class="guild-bank"
                >
                  {{ $t('guildBank') }}
                </div>
              </div>
            </div>
            <div class="row">
              <category-tags
                v-once
                class="col-md-12"
                :categories="guild.categories"
                :owner="isOwner"
              >
                <span
                  v-if="showSuggested(guild._id)"
                  class="recommend-text"
                >{{ $t('suggestedGroup') }}</span>
              </category-tags>
            </div>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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

      .member-count {
        color: #fdbb5a;
      }
    }

    .silver {
      color: #c2c2c2;

      .member-count {
        color: #c2c2c2;
      }
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
      top: -3.7em;
      font-size: 18px;
      font-weight: bold;
      line-height: 1.1;
      text-align: center;
      color: #b36213;
      margin-top: 2.0em;
    }

    .gem-bank {
      margin-top: 2em;

      .gem {
        width: 24px;
        display: inline-block;
        vertical-align: bottom;
        margin-right: .8em;
      }
    }
  }
</style>

<script>
import moment from 'moment';
import { mapState } from '@/libs/store';
import categoryTags from '../categories/categoryTags';
import groupUtilities from '@/mixins/groupsUtilities';
import markdown from '@/directives/markdown';
import gemIcon from '@/assets/svg/gem.svg';
import goldGuildBadgeIcon from '@/assets/svg/gold-guild-badge-large.svg';
import silverGuildBadgeIcon from '@/assets/svg/silver-guild-badge-large.svg';
import bronzeGuildBadgeIcon from '@/assets/svg/bronze-guild-badge-large.svg';
import { MAX_SUMMARY_SIZE_FOR_GUILDS } from '@/../../common/script/constants';

export default {
  directives: {
    markdown,
  },
  components: {
    categoryTags,
  },
  mixins: [groupUtilities],
  props: ['guild', 'displayLeave', 'displayGemBank'],
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
  computed: {
    ...mapState({ user: 'user.data' }),
    isOwner () {
      return this.guild.leader && this.guild.leader === this.user._id;
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  methods: {
    showSuggested (guildId) {
      const habiticaHelpingGuildId = '5481ccf3-5d2d-48a9-a871-70a7380cee5a';
      const sixtyDaysAgoFromNow = moment().subtract(60, 'days');
      const isUserNew = moment(this.user.auth.timestamps.created).isAfter(sixtyDaysAgoFromNow);
      return guildId === habiticaHelpingGuildId && isUserNew;
    },
    async join () {
      // @TODO: This needs to be in the notifications where users will now accept invites
      if (this.guild.cancelledPlan && !window.confirm(window.env.t('aboutToJoinCancelledGroupPlan'))) { // eslint-disable-line no-alert
        return;
      }
      await this.$store.dispatch('guilds:join', { groupId: this.guild._id, type: 'guild' });
    },
    async leave () {
      // @TODO: ask about challenges when we add challenges
      await this.$store.dispatch('guilds:leave', { groupId: this.guild._id, type: 'myGuilds' });
    },
  },
};
</script>
