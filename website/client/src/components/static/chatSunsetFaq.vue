<template>
  <div class="col-12 col-sm-8 container-fluid d-flex mx-auto main-bg">
    <div class="col-12 col-sm-8">
      <div class="row">
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
      <div class="section sidebar-content">
        <div class="px-4">
          <sidebar-section :title="$t('staff')">
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
          </sidebar-section>
          <sidebar-section :title="$t('playerTiers')">
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
          </sidebar-section>
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
    margin-bottom: 1.5em;
  }

  ul {
    padding-left: 20px;
  }

  li::marker {
    size: 0.5em;
  }

  #app {
    background-color: $white !important;
  }

  .main-bg {
    font-size: 16px !important;
  }

  .headings {
    font-size: 1em;
    font-weight: 400;
    line-height: 1.75;
    color: $purple-200;
  }

  .body-text {
    font-size: 0.875em;
    color: $gray-10;
    line-height: 1.71;
  }

  .sidebar-content {
    width: 330px !important;
    background-color: $gray-700;
    max-height: fit-content;
    padding: 24px 0;
    margin: 0 0 22px 24px;
    border-radius: 16px;
  }

.svg-icon {
    width: 10px;
    display: inline-block;
    margin-left: -1px;
  }

  .tier1-icon, .tier2-icon {
    width: 10px;
  }

  .tier5-icon, .tier6-icon {
    width: 8px;
  }

  .tier7-icon {
    width: 10px;
  }

  .mod-icon {
    width: 12px;
  }

  .staff-header {
    font-size: 0.875em;
    font-weight: bold;
    line-height: 1.71;
    margin-bottom: 8px;
  }

  .staff {
    font-size: 0.875em;

    .staff-icon {
      width: 10px;
      margin-left: 4px;
    }

    .title {
      color: $purple-300;
      font-weight: bold;
      line-height: 1.71;
      display: inline-block;
      margin-bottom: 4px;
    }
  }

  .player-header {
    font-size: 0.875em;
    font-weight: bold;
    line-height: 1.71;
    margin-top: 24px;
    margin-bottom: 8px;
  }
    .tier-list {
    list-style-type: none;
    padding: 0;
    width: 282px;

    li {
      border-radius: 4px;
      border: solid 1px $gray-500;
      text-align: center;
      padding-top: 8px;
      padding-bottom: 8px;
      margin-bottom: 8px;
      margin-right: 4px;
      font-weight: bold;
      font-size: 0.875em;
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
      color: $purple-300;
    }

    .npc {
      color: $black;
    }
  }

  .staff .title {
    color: $purple-300;
  }

  .moderator .title {
    color: #277eab;
  }
</style>

<script>
import sidebarSection from '../sidebarSection';
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
  componenets: {
    sidebarSection,
  },

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

  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('faq/taverns-and-guilds'),
    });
    document.body.style.background = '#ffffff';
  },
};
</script>
