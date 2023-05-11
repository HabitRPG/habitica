<template>
  <div class="row">
    <world-boss-info-modal />
    <world-boss-rage-modal />
    <div class="col-12 col-sm-8 clearfix standard-page">
      <div class="row">
        <div class="col-6 title-details">
          <h1 v-once>
            {{ $t('welcomeToTavern') }}
          </h1>
        </div>
      </div>
      <chat
        :label="$t('tavernChat')"
        :group="group"
        :placeholder="$t('tavernCommunityGuidelinesPlaceholder')"
        @fetchRecentMessages="fetchRecentMessages()"
      />
    </div>
    <div class="col-12 col-sm-4 sidebar">
      <div class="section">
        <div
          class="grassy-meadow-backdrop"
          :style="{'background-image': imageURLs.background}"
        >
          <div
            class="daniel_front"
            :style="{'background-image': imageURLs.npc}"
          ></div>
        </div>
        <div class="boss-section">
          <div
            v-if="group && group.quest && group.quest.active"
            class="world-boss"
            :style="{
              background: questData.colors.dark,
              'border-color': questData.colors.extralight,
              'outline-color': questData.colors.light}"
          >
            <div
              class="corner-decoration"
              :style="{top: '-2px', right: '-2px'}"
            ></div>
            <div
              class="corner-decoration"
              :style="{top: '-2px', left: '-2px'}"
            ></div>
            <div
              class="corner-decoration"
              :style="{bottom: '-2px', right: '-2px'}"
            ></div>
            <div
              class="corner-decoration"
              :style="{bottom: '-2px', left: '-2px'}"
            ></div>
            <div class="text-center float-bar d-flex align-items-center">
              <span class="diamond"></span>
              <span
                class="strong reduce"
                :style="{background: questData.colors.dark}"
              >{{ $t('worldBossEvent') }}</span>
              <span class="diamond"></span>
            </div>
            <div class="boss-gradient pb-3 pt-3">
              <p
                class="text-center reduce"
                :style="{color: questData.colors.extralight}"
              >
                {{ $t(`${questData.key}ArtCredit`) }}
              </p>
              <div
                class="quest-boss"
                :class="'background_' + questData.key"
              >
                <div
                  class="quest-boss"
                  :class="'quest_' + questData.key"
                ></div>
                <div
                  class="quest-boss"
                  :class="'phobia_' + questData.key"
                  :style="{display: 'none'}"
                ></div>
              </div>
            </div>
            <div class="p-3">
              <div class="row d-flex align-items-center mb-2">
                <div class="col-sm-6">
                  <strong class="float-left">{{ questData.boss.name() }}</strong>
                </div>
                <div class="col-sm-6">
                  <span class="d-flex float-right">
                    <div
                      class="svg-icon boss-icon"
                      v-html="icons.swordIcon"
                    ></div>
                    <span
                      class="ml-1 reduce"
                      :style="{color: questData.colors.extralight}"
                    >{{ $t('pendingDamage', {damage: pendingDamage()}) }}</span>
                  </span>
                </div>
              </div>
              <div class="grey-progress-bar mb-1">
                <div
                  class="boss-health-bar"
                  :style="{width: (group.quest.progress.hp / questData.boss.hp) * 100 + '%'}"
                ></div>
              </div>
              <span class="d-flex align-items-center">
                <div
                  class="svg-icon boss-icon"
                  v-html="icons.healthIcon"
                ></div>
                <span
                  class="reduce ml-1 pt-1"
                >{{ $t('bossHealth', {
                  currentHealth: bossCurrentHealth(),
                  maxHealth: questData.boss.hp.toLocaleString()}) }}</span>
              </span>
              <div class="mt-3 mb-2">
                <strong class="mr-1">{{ $t('rageAttack') }}</strong>
                <span>{{ questData.boss.rage.title() }}</span>
              </div>
              <div class="grey-progress-bar mb-1">
                <div
                  class="boss-health-bar rage-bar"
                  :style="{
                    width: (group.quest.progress.rage / questData.boss.rage.value) * 100 + '%'}"
                ></div>
              </div>
              <span class="d-flex align-items-center">
                <div
                  class="svg-icon boss-icon"
                  v-html="icons.rageIcon"
                ></div>
                <span
                  class="reduce ml-1 pt-1"
                >{{ $t('bossRage', {
                  currentRage: bossCurrentRage(),
                  maxRage: questData.boss.rage.value.toLocaleString()}) }}</span>
              </span>
              <div class="row d-flex align-items-center mb-2 mt-2">
                <div class="col-sm-4 d-flex">
                  <strong class="mr-2">{{ $t('rageStrikes') }}</strong>
                  <div
                    v-b-tooltip.hover.top="questData.boss.rage.description()"
                    class="svg-icon boss-icon information-icon m-auto"
                    v-html="icons.informationIcon"
                  ></div>
                </div>
                <div class="col-sm-8 d-flex align-items-center justify-content-center">
                  <div
                    class="m-auto"
                    @click="showWorldBossRage('seasonalShop')"
                  >
                    <img
                      v-if="!group.quest.extra.worldDmg.seasonalShop"
                      class="rage-strike"
                      src="~@/assets/images/world-boss/rage_strike@2x.png"
                    >
                    <img
                      v-if="group.quest.extra.worldDmg.seasonalShop"
                      class="rage-strike-active"
                      src="~@/assets/images/world-boss/rage_strike-seasonalShop@2x.png"
                    >
                  </div>
                  <div
                    class="m-auto"
                    @click="showWorldBossRage('market')"
                  >
                    <img
                      v-if="!group.quest.extra.worldDmg.market"
                      class="rage-strike"
                      src="~@/assets/images/world-boss/rage_strike@2x.png"
                    >
                    <img
                      v-if="group.quest.extra.worldDmg.market"
                      class="rage-strike-active"
                      src="~@/assets/images/world-boss/rage_strike-market@2x.png"
                    >
                  </div>
                  <div
                    class="m-auto"
                    @click="showWorldBossRage('quests')"
                  >
                    <img
                      v-if="!group.quest.extra.worldDmg.quests"
                      class="rage-strike"
                      src="~@/assets/images/world-boss/rage_strike@2x.png"
                    >
                    <img
                      v-if="group.quest.extra.worldDmg.quests"
                      class="rage-strike-active"
                      src="~@/assets/images/world-boss/rage_strike-quests@2x.png"
                    >
                  </div>
                </div>
              </div>
              <div
                class="boss-description p-3"
                :style="{'border-color': questData.colors.extralight}"
                @click="sections.worldBoss = !sections.worldBoss"
              >
                <strong class="float-left">{{ $t('worldBossDescription') }}</strong>
                <div class="float-right">
                  <div
                    v-if="!sections.worldBoss"
                    class="toggle-down"
                  >
                    <div
                      class="svg-icon boss-icon"
                      v-html="icons.chevronIcon"
                    ></div>
                  </div>
                  <div
                    v-if="sections.worldBoss"
                    class="toggle-up"
                  >
                    <div
                      class="svg-icon boss-icon reverse"
                      v-html="icons.chevronIcon"
                    ></div>
                  </div>
                </div>
              </div>
              <div
                v-if="sections.worldBoss"
                class="mt-3"
                v-html="questData.notes()"
              ></div>
            </div>
          </div>
          <!-- .text-center.mt-4.world-boss
          -info-button(@click="showWorldBossInfo()") {{$t('whatIsWorldBoss') }}
          -->
        </div>
        <div class="sleep px-4 py-3">
          <strong v-once>{{ $t('sleepDescription') }}</strong>
          <ul>
            <li v-once>
              {{ $t('sleepBullet1') }}
            </li>
            <li v-once>
              {{ $t('sleepBullet2') }}
            </li>
            <li v-once>
              {{ $t('sleepBullet3') }}
            </li>
          </ul>
          <button
            v-if="!user.preferences.sleep"
            v-once
            class="btn btn-secondary pause-button"
            @click="toggleSleep()"
          >
            {{ $t('pauseDailies') }}
          </button>
          <button
            v-if="user.preferences.sleep"
            v-once
            class="btn btn-secondary pause-button"
            @click="toggleSleep()"
          >
            {{ $t('unpauseDailies') }}
          </button>
        </div>
      </div>
      <div class="px-4">
        <sidebar-section :title="$t('staff')">
          <div class="row">
            <div
              v-for="user in staff"
              :key="user.uuid"
              class="col-6 staff"
              :class="{
                staff: user.type === 'Staff',
                moderator: user.type === 'Moderator'}"
            >
              <div>
                <router-link
                  class="title"
                  :to="{'name': 'userProfile', 'params': {'userId': user.uuid}}"
                >
                  {{ user.name }}
                </router-link>
                <div
                  v-if="user.type === 'Staff'"
                  class="svg-icon staff-icon"
                  v-html="icons.tierStaff"
                ></div>
              </div>
            </div>
          </div>
        </sidebar-section>
        <sidebar-section :title="$t('helpfulLinks')">
          <ul>
            <li>
              <a href="mailto:admin@habitica.com">
                {{ $t('reportCommunityIssues') }}
              </a>
            </li>
            <li>
              <router-link
                v-once
                to="/static/community-guidelines"
              >
                {{ $t('communityGuidelines') }}
              </router-link>
            </li>
            <li>
              <router-link
                to="/groups/guild/f2db2a7f-13c5-454d-b3ee-ea1f5089e601"
              >
                {{ $t('lookingForGroup') }}
              </router-link>
            </li>
            <li>
              <router-link
                v-once
                to="/static/faq"
              >
                {{ $t('faq') }}
              </router-link>
            </li>
            <li>
              <a
                href
                :style="glossary-link"
                v-html="$t('glossary')"
              ></a>
            </li>
            <li>
              <a
                v-once
                href="https://habitica.fandom.com/wiki/Habitica_Wiki"
                target="_blank"
              >{{ $t('wiki') }}</a>
            </li>
            <li>
              <a
                v-once
                href="https://tools.habitica.com/"
                target="_blank"
              >{{ $t('dataDisplayTool') }}</a>
            </li>
            <li>
              <a
                href=""
                target="_blank"
                @click.prevent="openBugReportModal()"
              >
                {{ $t('reportBug') }}
              </a>
            </li>
            <li>
              <a
                v-once
                href="https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link"
                target="_blank"
              >{{ $t('requestFeature') }}</a>
            </li>
            <li>
              <router-link
                to="/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a"
              >
                {{ $t('askQuestionGuild') }}
              </router-link>
            </li>
          </ul>
        </sidebar-section>
        <sidebar-section :title="$t('playerTiers')">
          <div class="row">
            <div class="col-12">
              <p v-once>
                {{ $t('playerTiersDesc') }}
              </p>
              <ul class="tier-list">
                <li
                  v-once
                  class="tier1"
                >
                  {{ $t('tier1') }}
                  <div
                    class="svg-icon tier1-icon"
                    v-html="icons.tier1"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier2"
                >
                  {{ $t('tier2') }}
                  <div
                    class="svg-icon tier2-icon"
                    v-html="icons.tier2"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier3"
                >
                  {{ $t('tier3') }}
                  <div
                    class="svg-icon tier3-icon"
                    v-html="icons.tier3"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier4"
                >
                  {{ $t('tier4') }}
                  <div
                    class="svg-icon tier4-icon"
                    v-html="icons.tier4"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier5"
                >
                  {{ $t('tier5') }}
                  <div
                    class="svg-icon tier5-icon"
                    v-html="icons.tier5"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier6"
                >
                  {{ $t('tier6') }}
                  <div
                    class="svg-icon tier6-icon"
                    v-html="icons.tier6"
                  ></div>
                </li>
                <li
                  v-once
                  class="tier7"
                >
                  {{ $t('tier7') }}
                  <div
                    class="svg-icon tier7-icon"
                    v-html="icons.tier7"
                  ></div>
                </li>
                <li
                  v-once
                  class="moderator"
                >
                  {{ $t('tierModerator') }}
                  <div
                    class="svg-icon mod-icon"
                    v-html="icons.tierMod"
                  ></div>
                </li>
                <li
                  v-once
                  class="staff"
                >
                  {{ $t('tierStaff') }}
                  <div
                    class="svg-icon staff-icon"
                    v-html="icons.tierStaff"
                  ></div>
                </li>
                <li
                  v-once
                  class="npc"
                >
                  {{ $t('tierNPC') }}
                  <div
                    class="svg-icon npc-icon"
                    v-html="icons.tierNPC"
                  ></div>
                </li>
              </ul>
            </div>
          </div>
        </sidebar-section>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  h1 {
    color: $purple-200;
  }

  .sidebar {
    background-color: $gray-600;
    padding: 0em;
  }

  .pause-button {
    background-color: #ffb445 !important;
    color: $white;
    width: 100%;
  }

  .grassy-meadow-backdrop {
    background-repeat: repeat-x;
    width: 100%;
    height: 246px;
  }

  .daniel_front {
    height: 246px;
    width: 471px;
    background-repeat: no-repeat;
    margin: 0 auto;
  }

  .svg-icon {
    width: 10px;
    display: inline-block;
    margin-left: .5em;
  }

  .tier1-icon, .tier2-icon {
    width: 11px;
  }

  .tier5-icon, .tier6-icon {
    width: 8px;
  }

  .tier7-icon {
    width: 12px;
  }

  .mod-icon {
    width: 13px;
  }

  .npc-icon {
    width: 8px;
  }

  .boss-icon {
    width: 16px;
    margin-top: .1em;
    margin-left: 0;
  }

  .boss-icon-large {
    width: 48px;
  }

  .staff {
    margin-bottom: 1em;

    .staff-icon  {
      width: 11px;
    }

    .title {
      color: #6133b4;
      font-weight: bold;
      display: inline-block;
    }
  }

  .tier-list {
    list-style-type: none;
    padding: 0;
    width: 98%;

    li {
      border-radius: 2px;
      background-color: #edecee;
      border: solid 1px #c3c0c7;
      text-align: center;
      padding: 1em;
      margin-bottom: 1em;
      font-weight: bold;
    }

    .tier1 {
      color: #c42870;
    }

    .tier2 {
      color: #b01515;
    }

    .tier3 {
      color: #d70e14;
    }

    .tier4 {
      color: #c24d00;
    }

    .tier5 {
      color: #9e650f;
    }

    .tier6 {
      color: #2b8363;
    }

    .tier7 {
      color: #167e87;
    }

    .tier8, .moderator {
      color: #277eab;
    }

    .tier9, .staff {
      color: #6133b4;
    }

    .npc {
      color: $black;
    }
  }

  .staff .title {
    color: #6133b4;
  }

  .moderator .title {
    color: #277eab;
  }

  .bailey .title {
    color: $black;
  }

  .boss-section {
    padding: 1.75em;
  }

  .world-boss {
    color: $white;
    border-style: solid;
    border-width: 2px;
    outline-style: solid;
    outline-width: 2px;
    margin: 2px;
    position: relative;
  }

  .quest-boss {
    margin: 1em auto;
  }

  .grey-progress-bar {
    width: 100%;
    height: 15px;
    background-color: rgba(255, 255, 255, 0.24);
    border-radius: 2px;
  }

  .boss-health-bar {
    width: 80%;
    height: 15px;
    margin-bottom: .5em;
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    background-color: #f74e52;
  }

  .boss-health-bar.rage-bar {
    background-color: #ff944c;
  }

  .boss-gradient {
    background-image: linear-gradient(to bottom, #401f2a, #931f4d);
    margin-top: -1.4em;
  }

  .boss-description {
    border-top: 1px solid;
    margin-left: -16px;
    margin-right: -16px;
    padding: .25em 0 0 .25em;
  }

  .float-bar {
    position: relative;
    top: -16px;
    width: 162px;
    height: 28px;
    border-radius: 2px;
    background-color: inherit;
    margin: auto;
  }

  .corner-decoration {
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: inherit;
    border: inherit;
    outline: inherit;
  }

  .reverse {
    transform: rotate(180deg);
  }

  .diamond {
    margin: auto;
    display: inline-block;
    width: 6px;
    height: 6px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    background-color: #dc4069;
    border: solid 2px #931f4d;
  }

  .reduce {
    font-size: 12px;
  }

  .rage-strike {
    max-width: 50px;
    height: auto;
  }

  .rage-strike-active {
    max-width: 75px;
    height: auto;
    cursor: pointer;
  }

  .world-boss-info-button {
    width: 100%;
    background-color: $gray-500;
    border-radius: 2px;
    font-size: 14px;
    color: $blue-10;
    padding: 1em;
    cursor: pointer;
  }
</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';
import { goToModForm } from '@/libs/modform';

import { TAVERN_ID } from '@/../../common/script/constants';
import worldBossInfoModal from '../world-boss/worldBossInfoModal';
import worldBossRageModal from '../world-boss/worldBossRageModal';
import sidebarSection from '../sidebarSection';
import chat from './chat';

import challengeIcon from '@/assets/svg/challenge.svg';
import chevronIcon from '@/assets/svg/chevron-red.svg';
import gemIcon from '@/assets/svg/gem.svg';
import healthIcon from '@/assets/svg/health.svg';
import informationIconRed from '@/assets/svg/information-red.svg';
import questBackground from '@/assets/svg/quest-background-border.svg';
import rageIcon from '@/assets/svg/rage.svg';
import swordIcon from '@/assets/svg/sword.svg';

import tier1 from '@/assets/svg/tier-1.svg';
import tier2 from '@/assets/svg/tier-2.svg';
import tier3 from '@/assets/svg/tier-3.svg';
import tier4 from '@/assets/svg/tier-4.svg';
import tier5 from '@/assets/svg/tier-5.svg';
import tier6 from '@/assets/svg/tier-6.svg';
import tier7 from '@/assets/svg/tier-7.svg';
import tierMod from '@/assets/svg/tier-mod.svg';
import tierNPC from '@/assets/svg/tier-npc.svg';
import tierStaff from '@/assets/svg/tier-staff.svg';

import * as quests from '@/../../common/script/content/quests';
import staffList from '../../libs/staffList';
import reportBug from '@/mixins/reportBug.js';

export default {
  components: {
    worldBossInfoModal,
    worldBossRageModal,
    sidebarSection,
    chat,
  },
  mixins: [reportBug],
  data () {
    return {
      groupId: TAVERN_ID,
      icons: Object.freeze({
        challengeIcon,
        chevronIcon,
        gem: gemIcon,
        healthIcon,
        informationIcon: informationIconRed,
        questBackground,
        rageIcon,
        swordIcon,
        tier1,
        tier2,
        tier3,
        tier4,
        tier5,
        tier6,
        tier7,
        tierMod,
        tierNPC,
        tierStaff,
      }),
      group: {
        chat: [],
      },
      sections: {
        worldBoss: true,
      },
      staff: staffList,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      currentEventList: 'worldState.data.currentEventList',
    }),
    questData () {
      if (!this.group.quest) return {};
      return quests.quests[this.group.quest.key];
    },
    imageURLs () {
      const currentEvent = find(this.currentEventList, event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/tavern_background.png)',
          npc: 'url(/static/npc/normal/tavern_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${currentEvent.season}/tavern_background.png)`,
        npc: `url(/static/npc/${currentEvent.season}/tavern_npc.png)`,
      };
    },
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('tavern'),
      section: this.$t('guilds'),
    });
    this.group = await this.$store.dispatch('guilds:getGroup', { groupId: TAVERN_ID });
  },
  methods: {
    modForm () {
      goToModForm(this.user);
    },
    toggleSleep () {
      this.$store.dispatch('user:sleep');
    },

    pendingDamage () {
      if (!this.user.party.quest.progress.up) return 0;
      return this.$options.filters.floor(this.user.party.quest.progress.up, 10);
      // keep user's pending damage consistent with how it's displayed on the party page
    },
    bossCurrentHealth () {
      if (!this.group.quest.progress.hp) return 0;

      return Math.ceil(parseFloat(this.group.quest.progress.hp)).toLocaleString();
    },
    bossCurrentRage () {
      if (!this.group.quest.progress.hp) return 0;

      return Math.floor(parseFloat(this.group.quest.progress.rage)).toLocaleString();
    },
    showWorldBossInfo () {
      this.$root.$emit('bv::show::modal', 'world-boss-info');
    },
    showWorldBossRage (npc) {
      if (this.group.quest.extra.worldDmg[npc]) {
        this.$store.state.rageModalOptions.npc = npc;
        this.$root.$emit('bv::show::modal', 'world-boss-rage');
      }
    },
    async fetchRecentMessages () {
      this.group = await this.$store.dispatch('guilds:getGroup', { groupId: TAVERN_ID });
    },
  },
};
</script>
