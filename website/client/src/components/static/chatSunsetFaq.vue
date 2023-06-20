<template>
  <div class="col-sm-8 container-fluid d-flex mx-auto">
    <div class="col-sm-8">
      <div class="row">
        <!-- title goes here -->
        <div class="title-details">
          <h1 v-once>
            {{ $t('sunsetFaqTitle') }}
          </h1>
        </div>
        <div class="section">
          <div class="body-text">
            <p v-html="$t('sunsetFaqPara1')"></p>  <!-- there's html in here -->
            <p>{{ $t('sunsetFaqPara2') }}</p>
            <p>{{ $t('sunsetFaqPara3') }}</p>
            <p>{{ $t('sunsetFaqPara4') }}</p>
            <p>{{ $t('sunsetFaqPara5') }}</p>
          </div>

          <!-- Which services are ending -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader1') }}
            </h3>
          </div>
          <div class="body-text">
            <p v-html="$t('sunsetFaqPara6')"></p>
          </div>

          <!-- Why are tavern and guild ending? -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader2') }}
            </h3>
          </div>
          <div class="body-text">
            <ul>
              <li>{{ $t('sunsetFaqList1') }}</li>
              <li>{{ $t('sunsetFaqList2') }}</li>
              <li>{{ $t('sunsetFaqList3') }}</li>
            </ul>
          </div>

          <!-- Can I still talk to my party/group members? -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader3') }}
            </h3>
          </div>
          <div class="body-text">
            <p>{{ $t('sunsetFaqPara7') }}</p>
          </div>

          <!-- Pausing dailies -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader4') }}
            </h3>
          </div>
          <div class="body-text">
            <p>{{ $t('sunsetFaqPara8') }}</p>
          </div>

          <!-- Accessing group plans -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader5') }}
            </h3>
          </div>
          <div class="body-text">
            <p v-html="$t('sunsetFaqPara9')"></p> <!-- there's html in here -->
          </div>

          <!-- Can I access guild chats? -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader6') }}
            </h3>
          </div>
          <div class="body-text">
            <p>{{ $t('sunsetFaqPara10') }}</p>
          </div>

          <!-- How can players find groups? -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader7') }}
            </h3>
          </div>
          <div class="body-text">
            <p>{{ $t('sunsetFaqPara11') }}</p>
          </div>

          <!-- What about contributors? -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader8') }}
            </h3>
          </div>
          <div class="body-text">
            <p v-html="$t('sunsetFaqPara12')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara13')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara14')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara15')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara16')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara17')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara18')"></p> <!-- there's html in here -->
            <p v-html="$t('sunsetFaqPara19')"></p> <!-- there's html in here -->
          </div>

          <!-- Challenges -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader9') }}
            </h3>
          </div>
          <div class="body-text">
            <ul>
              <li>{{ $t('sunsetFaqList4') }}</li>
              <li>{{ $t('sunsetFaqList5') }}</li>
              <li>{{ $t('sunsetFaqList6') }}</li>
              <li>{{ $t('sunsetFaqList7') }}</li>
            </ul>
          </div>

          <!-- Questions about how to use Habitica -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader10') }}
            </h3>
          </div>
          <div class="body-text">
            <ul>
              <li v-html="$t('sunsetFaqList8')"></li> <!-- there's html in here -->
              <li v-html="$t('sunsetFaqList9')"></li> <!-- there's html in here -->
              <li v-html="$t('sunsetFaqList10')"></li> <!-- there's html in here -->
            </ul>
          </div>

          <!-- Community Guidelines and TOS -->
          <div>
            <h3 class="headings">
              {{ $t('sunsetFaqHeader11') }}
            </h3>
          </div>
          <div class="body-text">
            <p v-html="$t('sunsetFaqPara20')"></p>
          </div>
        </div>
      </div>
    </div>

    <!-- sidebar -->
    <!-- staff -->
    <div class="sidebar">
      <div class="section">
        <div class="px-4">
          <div class="staff-header">
            {{ $t('staff') }}
          </div>
          <div class="row">
            <div
              v-for="user in staff"
              :key="user.uuid"
              class="col-6 staff"
              :class="{
                staff: user.type === 'Staff',}"
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

          <!-- player tiers -->
          <div class="row">
            <div class="col-12">
              <div class="player-header">
                {{ $t('playerTiers') }}
              </div>
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
                </li>
              </ul>
            </div>
          </div>

          <!-- Daniel in sweet, sweet retirement with Jorts -->
          <div class="row daniel-width">
            <div class="gradient">
            </div>
            <div
              class="grassy-meadow-backdrop"
              :style="{'background-image': imageURLs.background}"
            >
              <div
                class="daniel_front"
                :style="{'background-image': imageURLs.npc}"
              ></div>
              <div
                class="pixel-border"
                :style="{'background-image': imageURLs.pixel_border}"
              ></div>
            </div>
          </div>

          <!-- email admin -->
          <div class="row d-flex">
            <div class="question mx-auto">
              <p>{{ $t('anotherQuestion') }}</p>
            </div>
            <div
              class="contact mx-auto"
            >
              <p v-html="$t('contactAdmin')"></p> <!-- there's html in here -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- final div! -->
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h1 {
    margin-top: 0px;
    line-height: 1.33;
  }

  p {
    margin-bottom: 21px;
  }

  ul {
    padding-left: 20px;
  }

  li::marker {
    size: 0.5em;
  }

  li {
    padding-bottom: 16px;
  }

  .headings {
    font-size: 1.15em;
    font-weight: 400;
    line-height: 1.75;
    color: $purple-200;
  }

  .body-text {
    font-size: 1em;
    color: $gray-10;
    line-height: 1.71;
  }

  .sidebar {
    background-color: $gray-700;
    padding: 24px 0;
    margin: 0 0 22px 24px;
    border-radius: 16px;
    width: 330px;
    max-height: fit-content;;
  }

.svg-icon {
    width: 10px;
    display: inline-block;
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

  .staff-header {
    font-size: 1em;
    font-weight: bold;
    line-height: 1.71;
    margin-bottom: 8px;
    color: $gray-10;
  }

  .staff {
    font-size: 1em;

    .staff-icon {
      width: 10px;
      margin-left: 4px;
    }

    .title {
      height: 24px;
      color: $purple-300;
      font-weight: bold;
      display: inline-block;
      margin-bottom: 4px;
    }
  }

  .player-header {
    height: 24px;
    font-size: 1em;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 4px;
    color: $gray-10;
  }
    .tier-list {
    list-style-type: none;
    padding: 0;
    width: 100%;
    font-size: 1em !important;

    li {
      height: 40px;
      border-radius: 4px;
      border: solid 1px $gray-500;
      text-align: center;
      padding: 8px 0;
      margin-bottom: 8px;
      margin-right: 4px;
      font-weight: bold;
      line-height: 1.71;
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

  .daniel-width {
    max-width: 100%;
    margin-top: 24px;
    margin-left: -24px;
  }

  .gradient {
    position: absolute;
    width: 330px;
    height: 100px;
    margin: -1px 0 116px;
    background-image: linear-gradient(to bottom, $gray-700 0%, rgba(249, 249, 249, 0) 100%);
  }

  .grassy-meadow-backdrop {
    background-repeat: repeat-x;
    width: 330px;
    height: 246px;
  }

  .daniel_front {
    height: 246px;
    width: 330px;
    background-repeat: no-repeat;
    margin: 0 auto;
  }

  .pixel-border {
    width: 330px;
    height: 30px;
    background-repeat: no-repeat;
    position: absolute;
    margin-top: -30px;
  }

  .question p {
    font-size: 1em;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-10;
    margin-top: 24px;
    margin-bottom: 0px;
  }

  .contact p {
    font-size: 1em;
    margin-bottom: 0px;
  }

</style>

<script>
import find from 'lodash/find';
import { mapState } from '@/libs/store';

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
import staffList from '../../libs/staffList';

export default {
  data () {
    return {
      icons: Object.freeze({
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
      currentEventList: 'worldState.data.currentEventList',
    }),
    imageURLs () {
      const currentEvent = find(this.currentEventList, event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/tavern_background.png)',
          npc: 'url(/static/npc/normal/tavern_npc.png)',
          pixel_border: 'url(/static/npc/normal/pixel_border.png)',
        };
      }
      return {
        background: `url(/static/npc/${currentEvent.season}/tavern_background.png)`,
        npc: `url(/static/npc/${currentEvent.season}/tavern_npc.png)`,
        pixel_border: 'url(/static/npc/normal/pixel_border.png)',
      };
    },
  },

  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('faq/taverns-and-guilds'),
    });
    document.body.style.background = '#ffffff';
  },
};
</script>
