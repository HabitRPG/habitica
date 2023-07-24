<template>
  <div>
    <div class="d-flex justify-content-center">
      <div
        v-if="seekers.length > 0"
        class="fit-content mx-auto mt-4"
      >
        <div class="d-flex align-items-center">
          <h1 v-once class="my-auto mr-auto"> {{ $t('findPartyMembers') }}</h1>
          <div
            class="btn btn-secondary btn-sync ml-auto my-auto pl-2 pr-3 d-flex"
            @click="refreshList()"
          >
            <div class="svg-icon icon-16 color my-auto mr-2" v-html="icons.sync"></div>
            <div class="ml-auto"> {{ $t('refreshList') }} </div>
          </div>
        </div>
        <div class="d-flex flex-wrap seeker-list">
          <div
            v-for="(seeker, index) in seekers"
            :key="seeker._id"
            class="seeker"
          >
            <div class="d-flex">
              <avatar
                :member="seeker"
                :hideClassBadge="true"
                @click.native="showMemberModal(seeker._id)"
                class="mr-3 mb-2"
              />
              <div class="card-data">
                <user-link
                  :user-id="seeker._id"
                  :name="seeker.profile.name"
                  :backer="seeker.backer"
                  :contributor="seeker.contributor"
                />
                <div class="small-with-border pb-2 mb-2">
                  @{{ seeker.auth.local.username }} • {{ $t('level') }} {{ seeker.stats.lvl }}
                </div>
                <div
                  class="d-flex"
                >
                  <strong v-once> {{ $t('classLabel') }} </strong>
                  <span
                    class="svg-icon d-inline-block icon-16 my-auto mx-2"
                    v-html="icons[seeker.stats.class]"
                  >
                  </span>
                  <strong
                    :class="`${seeker.stats.class}-color`"
                  >
                    {{ $t(seeker.stats.class) }}
                  </strong>
                </div>
                <div>
                  <strong v-once class="mr-2"> {{ $t('checkinsLabel') }} </strong>
                  {{ seeker.loginIncentives }}
                </div>
                <div>
                  <strong v-once class="mr-2"> {{ $t('languageLabel') }} </strong>
                  {{ displayLanguage(seeker.preferences.language) }}
                </div>
              </div>
            </div>
            <strong
              v-if="!seeker.invited"
              @click="inviteUser(seeker._id, index)"
              class="btn btn-primary w-100"
            >
              {{ $t('inviteToParty') }}
            </strong>
            <div
              v-else
              @click="rescindInvite(seeker._id, index)"
              class="btn btn-success w-100"
              v-html="$t('invitedToYourParty')"
            >
            </div>
          </div>
          <mugen-scroll
            v-show="loading"
            :handler="infiniteScrollTrigger"
            :should-handle="!loading && canLoadMore"
            :threshold="1"
          />
        </div>
      </div>
      <div
        v-if="seekers.length === 0 && !loading"
        class="d-flex flex-column empty-state text-center my-5"
      >
        <div class="gray-circle mb-3 mx-auto d-flex">
          <div
            class="svg-icon icon-32 color m-auto"
            v-html="icons.users"
          >

          </div>
        </div>
        <strong class="mb-1"> {{ $t('findMorePartyMembers') }} </strong>
        <div v-html="$t('noOneLooking')"></div>
      </div>
    </div>
    <h2
      v-show="loading"
      class="loading"
      :class="seekers.length === 0 ? 'mt-3' : 'mt-0'"
    >
      {{ $t('loading') }}
    </h2>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h1 {
    color: $purple-300;
  }

  strong {
    line-height: 1.71;
  }
  .avatar {
    background-color: $gray-600;
  }

  .btn-success {
    box-shadow: none;
    color: $green-1;
    font-weight: normal;

    &:not(:disabled):not(.disabled):active {
      color: $green-1;
    }
  }

  .btn-sync {
    min-width: 128px;
    max-height: 32px;

    .svg-icon {
      color: $gray-200;
    }
  }

  .card-data {
    width: 267px;
  }

  .empty-state {
    color: $gray-100;
    line-height: 1.71;
  }

  .fit-content {
    width: fit-content;
  }

  .gray-circle {
    width: 64px;
    height: 64px;
    color: $gray-600;
    background-color: $gray-200;
    border-radius: 100px;

    .icon-32 {
      height: auto;
    }
  }

  .loading {
    text-align: center;
    color: $purple-300;
  }

  .seeker-list {
    max-width: 920px;

    @media (max-width: 962px) {
      max-width: 464px;
    };

    .seeker {
      width: 448px;
      margin-bottom: 24px;
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
      background-color: $white;

      &:first-of-type {
        margin-top: 24px;
      }

      @media (min-width: 963px) {
        &:nth-child(2) {
          margin-top: 24px;
        }
        &:nth-child(even) {
          margin-left: 24px;
        }
      }
    }
  }

  .small-with-border {
    border-bottom: 1px solid $gray-500;
    color: $gray-100;
    font-size: 12px;
    font-weight: normal;
    line-height: 1.33;
  }

  .healer-color {
    color: $yellow-10;
  }

  .rogue-color {
    color: $purple-200;
  }

  .warrior-color {
    color: $red-50;
  }

  .wizard-color {
    color: $blue-10;
  }
</style>

<script>
import debounce from 'lodash/debounce';
import MugenScroll from 'vue-mugen-scroll';
import Avatar from '../avatar';
import userLink from '../userLink';
import { mapState } from '@/libs/store';

import syncIcon from '@/assets/svg/sync-2.svg';
import usersIcon from '@/assets/svg/users.svg';
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';

export default {
  components: {
    Avatar,
    MugenScroll,
    userLink,
  },
  data () {
    return {
      canLoadMore: true,
      loading: true,
      page: 0,
      party: {},
      seekers: [],
      icons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        sync: syncIcon,
        users: usersIcon,
        wizard: wizardIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      availableLanguages: 'i18n.availableLanguages',
      user: 'user.data',
    }),
  },
  async mounted () {
    try {
      this.party = await this.$store.dispatch('guilds:getGroup', { groupId: this.user.party._id });
    } catch {
      this.$router.push('/');
    }
    if (!this.party._id || this.party.leader._id !== this.user._id) {
      this.$router.push('/');
    } else {
      this.$store.dispatch('common:setTitle', {
        section: this.$t('lookingForPartyTitle'),
      });
      this.seekers = await this.$store.dispatch('party:lookingForParty');
      this.canLoadMore = this.seekers.length === 30;
      this.loading = false;
    }
  },
  methods: {
    displayLanguage (languageCode) {
      const language = this.availableLanguages.find(lang => lang.code === languageCode);
      if (language) {
        return language.name;
      }
      return languageCode;
    },
    infiniteScrollTrigger () {
      if (this.canLoadMore) {
        this.loading = true;
      }

      this.loadMore();
    },
    async inviteUser (userId, index) {
      await this.$store.dispatch('guilds:invite', {
        invitationDetails: {
          inviter: this.user.profile.name,
          uuids: [userId],
        },
        groupId: this.party._id,
      });
      this.seekers[index].invited = true;
    },
    loadMore: debounce(async function loadMoreDebounce () {
      this.page += 1;
      const addlSeekers = await this.$store.dispatch('party:lookingForParty', { page: this.page });
      this.seekers = this.seekers.concat(addlSeekers);
      this.canLoadMore = this.seekers.length % 30 === 0;
      this.loading = false;
    }, 1000),
    async refreshList () {
      this.loading = true;
      this.page = 0;
      this.seekers = await this.$store.dispatch('party:lookingForParty');
      this.canLoadMore = this.seekers.length === 30;
      this.loading = false;
    },
    async rescindInvite (userId, index) {
      await this.$store.dispatch('members:removeMember', {
        memberId: userId,
        groupId: this.party._id,
      });
      this.seekers[index].invited = false;
    },
    showMemberModal (userId) {
      this.$router.push({ name: 'userProfile', params: { userId } });
    },
  },
};
</script>
