// eslint-disable-next-line vue/no-mutating-props
<template>
  <div class="top-container mx-auto">
    <div class="main-text mr-4 col-8">
      <!-- title goes here -->
      <div
        class="title-details"
        role="tablist"
      >
        <div class="body-text">
          <h1
            v-once
            id="faq-heading"
          >
            {{ $t('frequentlyAskedQuestions') }}
          </h1>
          <!-- subheadings go here -->
          <div
            v-for="(entry, index) in faq.questions"
            :key="index"
            class="body-text"
          >
            <h2
              v-if="index === 0"
              v-once
            >
              {{ $t('general') }}
            </h2>
            <h2
              v-if="entry.heading === 'play-with-others'"
              v-once
              id="parties"
            >
              {{ $t('parties') }}
            </h2>
            <h2
              v-if="entry.heading === 'what-is-group-plan'"
              v-once
              id="group-plans"
            >
              {{ $t('groupPlan') }}
            </h2>
            <!-- entry header goes here -->
            <h3
              v-once
              v-b-toggle="entry.heading"
              role="tab"
              variant="info"
              class="headings"
              @click="handleClick($event)"
            >
              {{ entry.question }}
            </h3>
            <b-collapse
              :id="entry.heading"
              :visible="isVisible(entry.heading)"
              accordion="faq"
              role="tabpanel"
            >
              <!-- questions go here -->
              <div
                v-once
                v-markdown="entry.web"
                class="card-body p-0 pb-3"
              ></div>
            </b-collapse>
          </div>
        </div>
      </div>
    </div>

    <!-- sidebar -->
    <div class="sidebar py-4 d-flex flex-column">
      <!-- staff -->
      <div class="ml-4">
        <h2>
          {{ $t('staff') }}
        </h2>
        <div class="d-flex flex-wrap">
          <div
            v-for="user in staff"
            :key="user.uuid"
            class="staff col-6 p-0"
          >
            <div class="d-flex">
              <router-link
                class="title"
                :to="{'name': 'userProfile', 'params': {'userId': user.uuid}}"
              >
                {{ user.name }}
              </router-link>
              <div
                v-if="user.type === 'Staff'"
                class="svg-icon staff-icon ml-1"
                v-html="icons.tierStaff"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <!-- player tiers -->
      <div class="ml-4">
        <h2 class="mt-4 mb-1">
          {{ $t('playerTiers') }}
        </h2>
        <ul class="tier-list">
          <li
            v-once
            class="tier1 d-flex justify-content-center"
          >
            {{ $t('tier1') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier1"
            ></div>
          </li>
          <li
            v-once
            class="tier2 d-flex justify-content-center"
          >
            {{ $t('tier2') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier2"
            ></div>
          </li>
          <li
            v-once
            class="tier3 d-flex justify-content-center"
          >
            {{ $t('tier3') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier3"
            ></div>
          </li>
          <li
            v-once
            class="tier4 d-flex justify-content-center"
          >
            {{ $t('tier4') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier4"
            ></div>
          </li>
          <li
            v-once
            class="tier5 d-flex justify-content-center"
          >
            {{ $t('tier5') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier5"
            ></div>
          </li>
          <li
            v-once
            class="tier6 d-flex justify-content-center"
          >
            {{ $t('tier6') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier6"
            ></div>
          </li>
          <li
            v-once
            class="tier7 d-flex justify-content-center"
          >
            {{ $t('tier7') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tier7"
            ></div>
          </li>
          <li
            v-once
            class="moderator d-flex justify-content-center"
          >
            {{ $t('tierModerator') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tierMod"
            ></div>
          </li>
          <li
            v-once
            class="staff d-flex justify-content-center"
          >
            {{ $t('tierStaff') }}
            <div
              class="svg-icon ml-1"
              v-html="icons.tierStaff"
            ></div>
          </li>
          <li
            v-once
            class="npc d-flex justify-content-center"
          >
            {{ $t('tierNPC') }}
          </li>
        </ul>
      </div>
      <!-- Daniel in sweet, sweet retirement with Jorts -->
      <div>
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
      <div class="d-flex flex-column justify-content-center">
        <div class="question mx-auto">
          {{ $t('anotherQuestion') }}
        </div>
        <div
          class="contact mx-auto"
        >
          <p v-html="$t('contactAdmin')"></p> <!-- there's html in here -->
        </div>
      </div>
    </div>

    <!-- final div! -->
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  h1 {
    line-height: 1.33;
    margin-top: 0px;
  }

  h2 {
    color: $gray-10;
    margin-top: 24px;

  }
  li {
    padding-bottom: 16px;

    &::marker {
      size: 0.5em;
    }
  }

  p {
    margin-bottom: 21px;
  }

  ul {
    padding-left: 20px;
  }

  .top-container {
    display: flex;
    margin-top: 80px;
    width: 66.67%;

    @media (max-width: 1024px) {
      flex-wrap: wrap;
    }
  }

  .main-text {
    .body-text {
      color: $gray-10;
      font-size: 14px;
      line-height: 1.71;
    }

    .headings {
      color: $purple-200;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.75;
    }
  }

  .faq-question {
    a {
      color: $purple-200;
      text-decoration: none;
    }

    h3 {
      cursor: pointer;
      font-size: 16px;
      font-weight: normal;
      line-height: 1.75;

      &:hover {
        text-decoration: underline;
      }
    }

    .card-body {
      font-size: 14px;
      line-height: 1.71;
      margin-bottom: 16px;
      padding: 0;
    }
  }

  .sidebar {
    height: fit-content;
    background-color: $gray-700;
    border-radius: 16px;
    width: 330px;
    margin-bottom: 24px;

    h2 {
      color: $gray-10;
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      line-height: 1.71;
      margin-top: 0px;
    }

    .staff {
      .staff-icon {
        margin-top: 5px;
        width: 10px;
      }

      .title {
        color: $purple-300;
        display: inline-block;
        font-weight: bold;
        height: 24px;
        margin-bottom: 4px;
      }
    }

    .tier-list {
      font-size: 1em !important;
      list-style-type: none;
      padding: 0;
      width: 282px;

      li {
        border-radius: 4px;
        border: solid 1px $gray-500;
        font-weight: bold;
        height: 40px;
        line-height: 1.71;
        margin-bottom: 8px;
        margin-right: 4px;
        padding: 8px 0;
        text-align: center;
      }

      .tier1 {
        color: #c42870;
        .svg-icon {
          margin-top: 5px;
          width: 11px;
        }
      }

      .tier2 {
        color: #b01515;
        .svg-icon {
          margin-top: 5px;
          width: 11px;
        }
      }

      .tier3 {
        color: #d70e14;
        .svg-icon {
          margin-top: 4px;
          width: 13px;
        }
      }

      .tier4 {
        color: #c24d00;
        .svg-icon {
          margin-top: 4px;
          width: 13px;
        }
      }

      .tier5 {
        color: #9e650f;
        .svg-icon {
          margin-top: 7px;
          width: 8px;
        }
      }

      .tier6 {
        color: #2b8363;
        .svg-icon {
          margin-top: 7px;
          width: 8px;
        }
      }

      .tier7 {
        color: #167e87;
        .svg-icon {
          margin-top: 4px;
          width: 12px;
        }
      }

      .moderator {
        color: #277eab;
        .svg-icon {
          margin-top: 3px;
          width: 13px;
        }
      }

      .staff {
        color: #6133b4;
        .svg-icon {
          margin-top: 7px;
          width: 10px;
        }
      }

      .npc {
        color: $black;
      }
    }

    .gradient {
      background-image: linear-gradient(to bottom, $gray-700 0%, rgba(249, 249, 249, 0) 100%);
      height: 100px;
      position: absolute;
      margin: -1px 0 116px;
      width: 330px;
    }

    .grassy-meadow-backdrop {
      background-repeat: repeat-x;
      height: 246px;
      width: 330px;
    }

    .daniel_front {
      background-repeat: no-repeat;
      height: 246px;
      margin: 0 auto;
      width: 330px;
    }

    .pixel-border {
      background-repeat: no-repeat;
      height: 30px;
      margin-top: -30px;
      position: absolute;
      width: 330px;
    }

    .question {
      color: $gray-10;
      font-size: 1em;
      font-weight: bold;
      line-height: 1.71;
      margin-top: 24px;
    }

    .contact p {
      font-size: 1em;
      margin-bottom: 0px;
    }
  }

</style>

<script>
import find from 'lodash/find';
import markdownDirective from '@/directives/markdown';
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
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      faq: {},
      headings: [],
      stillNeedHelp: '',
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
      section: this.$t('help'),
      subSection: this.$t('faq'),
    });
    this.faq = await this.$store.dispatch('faq:getFAQ');
    for (const entry of this.faq.questions) {
      this.headings.push(entry.heading);
    }
    this.stillNeedHelp = this.faq.stillNeedHelp.web;
    document.body.style.background = '#ffffff';
  },
  methods: {
    isVisible (heading) {
      const hash = window.location.hash.replace('#', '');
      return hash && this.headings.includes(hash) && hash === heading;
    },
    handleClick (e) {
      if (!e) return;
      const heading = e.target.nextElementSibling.id;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
