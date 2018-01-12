<template lang="pug">
.row
  .col-12.col-sm-8.clearfix.standard-page
    .row
      .col-6.title-details
        h1(v-once) {{ $t('welcomeToTavern') }}

    .row.chat-row
      .col-12
        h3(v-once) {{ $t('tavernChat') }}

        .row
          textarea(:placeholder="$t('tavernCommunityGuidelinesPlaceholder')", v-model='newMessage', :class='{"user-entry": newMessage}', @keydown='updateCarretPosition', @keyup.ctrl.enter='sendMessage()')
          autocomplete(:text='newMessage', v-on:select="selectedAutocomplete", :coords='coords', :chat='group.chat')

        .row
          .col-6
            button.btn.btn-secondary.float-left.fetch(v-once, @click='fetchRecentMessages()') {{ $t('fetchRecentMessages') }}
            button.btn.btn-secondary.float-left(v-once, @click='reverseChat()') {{ $t('reverseChat') }}
          .col-6
            button.btn.btn-secondary.send-chat.float-right(v-once, @click='sendMessage()') {{ $t('send') }}

        .row.community-guidelines(v-if='!communityGuidelinesAccepted')
          div.col-8(v-once, v-html="$t('communityGuidelinesIntro')")
          div.col-4
            button.btn.btn-info(@click='acceptCommunityGuidelines()', v-once) {{ $t('acceptCommunityGuidelines') }}

        .row
          .hr.col-12
          chat-message(:chat.sync='group.chat', :group-id='group._id', group-name='group.name')

  .col-12.col-sm-4.sidebar
    .section
      .grassy-meadow-backdrop
        .daniel_front

      .sleep.below-header-sections
        strong(v-once) {{ $t('sleepDescription') }}
        ul
          li(v-once) {{ $t('sleepBullet1') }}
          li(v-once) {{ $t('sleepBullet2') }}
          li(v-once) {{ $t('sleepBullet3') }}
          li(v-once) {{ $t('sleepBullet4') }}
        button.btn.btn-secondary.pause-button(v-if='!user.preferences.sleep', @click='toggleSleep()', v-once) {{ $t('pauseDailies') }}
        button.btn.btn-secondary.pause-button(v-if='user.preferences.sleep', @click='toggleSleep()', v-once) {{ $t('unpauseDailies') }}

    .below-header-sections
      .section-header
        .row
          .col-10
            h3(v-once) {{ $t('staffAndModerators') }}
          .col-2
            .toggle-up(@click="sections.staff = !sections.staff", v-if="sections.staff")
              .svg-icon(v-html="icons.upIcon")
            .toggle-down(@click="sections.staff = !sections.staff", v-if="!sections.staff")
              .svg-icon(v-html="icons.downIcon")
        .section.row(v-if="sections.staff")
          // @TODO open member modal when clicking on a staff member
          .col-4.staff(v-for='user in staff', :class='{staff: user.type === "Staff", moderator: user.type === "Moderator", bailey: user.name === "It\'s Bailey"}')
            div
              .title {{user.name}}
              .svg-icon.staff-icon(v-html="icons.tierStaff", v-if='user.type === "Staff"')
              .svg-icon.mod-icon(v-html="icons.tierMod", v-if='user.type === "Moderator" && user.name !== "It\'s Bailey"')
              .svg-icon.npc-icon(v-html="icons.tierNPC", v-if='user.name === "It\'s Bailey"')
            .type {{user.type}}

      .section-header
        .row
          .col-10
            h3(v-once) {{ $t('helpfulLinks') }}
          .col-2
            .toggle-up(@click="sections.helpfulLinks = !sections.helpfulLinks", v-if="sections.helpfulLinks")
              .svg-icon(v-html="icons.upIcon")
            .toggle-down(@click="sections.helpfulLinks = !sections.helpfulLinks", v-if="!sections.helpfulLinks")
              .svg-icon(v-html="icons.downIcon")
        .section.row(v-if="sections.helpfulLinks")
          ul
            li
             router-link(to='/static/community-guidelines', v-once) {{ $t('communityGuidelinesLink') }}
            li
              router-link(to="/groups/guild/f2db2a7f-13c5-454d-b3ee-ea1f5089e601") {{ $t('lookingForGroup') }}
            li
             router-link(to='/static/faq', v-once) {{ $t('faq') }}
            li
              a(href='', v-html="$t('glossary')")
            li
              a(href='http://habitica.wikia.com/wiki/Habitica_Wiki', v-once) {{ $t('wiki') }}
            li
              a(href='https://oldgods.net/habitrpg/habitrpg_user_data_display.html', v-once) {{ $t('dataDisplayTool') }}
            li
              router-link(to="/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac") {{ $t('reportProblem') }}
            li
              a(href='https://trello.com/c/odmhIqyW/440-read-first-table-of-contents', v-once) {{ $t('requestFeature') }}
            li
              a(href='', v-html="$t('communityForum')")
            li
              router-link(to="/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a") {{ $t('askQuestionGuild') }}

      .section-header
        .row
          .col-10
            h3(v-once) {{ $t('playerTiers') }}
          .col-2
            .toggle-up(@click="sections.playerTiers = !sections.playerTiers", v-if="sections.playerTiers")
              .svg-icon(v-html="icons.upIcon")
            .toggle-down(@click="sections.playerTiers = !sections.playerTiers", v-if="!sections.playerTiers")
              .svg-icon(v-html="icons.downIcon")
        .section.row(v-if="sections.playerTiers")
          .col-12
            p(v-once) {{ $t('playerTiersDesc') }}
            ul.tier-list
              li.tier1(v-once)
               | {{ $t('tier1') }}
               .svg-icon.tier1-icon(v-html="icons.tier1")
              li.tier2(v-once)
                | {{ $t('tier2') }}
                .svg-icon.tier2-icon(v-html="icons.tier2")
              li.tier3(v-once)
                | {{ $t('tier3') }}
                .svg-icon.tier3-icon(v-html="icons.tier3")
              li.tier4(v-once)
                | {{ $t('tier4') }}
                .svg-icon.tier4-icon(v-html="icons.tier4")
              li.tier5(v-once)
                | {{ $t('tier5') }}
                .svg-icon.tier5-icon(v-html="icons.tier5")
              li.tier6(v-once)
                | {{ $t('tier6') }}
                .svg-icon.tier6-icon(v-html="icons.tier6")
              li.tier7(v-once)
                | {{ $t('tier7') }}
                .svg-icon.tier7-icon(v-html="icons.tier7")
              li.moderator(v-once)
                | {{ $t('tierModerator') }}
                .svg-icon.mod-icon(v-html="icons.tierMod")
              li.staff(v-once)
                | {{ $t('tierStaff') }}
                .svg-icon.staff-icon(v-html="icons.tierStaff")
              li.npc(v-once)
                | {{ $t('tierNPC') }}
                .svg-icon.npc-icon(v-html="icons.tierNPC")
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/variables.scss';

  .chat-row {
    position: relative;

    .community-guidelines {
      background-color: rgba(135, 129, 144, 0.84);
      padding: 1em;
      color: $white;
      position: absolute;
      top: 0;
      height: 150px;
      padding-top: 3em;
      margin-top: 2.3em;
      width: 100%;
      border-radius: 4px;
    }

    textarea {
      height: 150px;
      width: 100%;
      background-color: $white;
      border: solid 1px $gray-400;
      font-size: 16px;
      font-style: italic;
      line-height: 1.43;
      color: $gray-300;
      padding: .5em;
    }

    .user-entry {
      font-style: normal;
      color: $black;
    }

    .hr {
      width: 100%;
      height: 20px;
      border-bottom: 1px solid $gray-500;
      text-align: center;
      margin: 2em 0;
    }

    .hr-middle {
      font-size: 16px;
      font-weight: bold;
      font-family: 'Roboto Condensed';
      line-height: 1.5;
      text-align: center;
      color: $gray-200;
      background-color: $gray-700;
      padding: .2em;
      margin-top: .2em;
      display: inline-block;
      width: 100px;
    }
  }

  h1 {
    color: $purple-200;
  }

  .sidebar {
    background-color: $gray-600;
    padding: 0em;

    .below-header-sections {
      padding: 1em;
    }
  }

  .pause-button {
    background-color: #ffb445 !important;
    color: $white;
    width: 100%;
  }

  .section-header {
    margin-top: 2em;
  }

  .grassy-meadow-backdrop {
    background-image: url('~assets/images/npc/#{$npc_tavern_flavor}/tavern_background.png');
    background-repeat: repeat-x;
    width: 100%;
    height: 246px;
  }

  .daniel_front {
    background-image: url('~assets/images/npc/#{$npc_tavern_flavor}/tavern_npc.png');
    height: 246px;
    width: 471px;
    background-repeat: no-repeat;
    margin: 0 auto;
  }

  .sleep {
    margin-top: 1em;
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

</style>

<script>
import debounce from 'lodash/debounce';
import { mapState } from 'client/libs/store';

import { TAVERN_ID } from '../../../common/script/constants';
import chatMessage from '../chat/chatMessages';
import autocomplete from '../chat/autoComplete';

import gemIcon from 'assets/svg/gem.svg';
import questIcon from 'assets/svg/quest.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import informationIcon from 'assets/svg/information.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';

import tier1 from 'assets/svg/tier-1.svg';
import tier2 from 'assets/svg/tier-2.svg';
import tier3 from 'assets/svg/tier-3.svg';
import tier4 from 'assets/svg/tier-4.svg';
import tier5 from 'assets/svg/tier-5.svg';
import tier6 from 'assets/svg/tier-6.svg';
import tier7 from 'assets/svg/tier-7.svg';
import tierMod from 'assets/svg/tier-mod.svg';
import tierNPC from 'assets/svg/tier-npc.svg';
import tierStaff from 'assets/svg/tier-staff.svg';

export default {
  components: {
    chatMessage,
    autocomplete,
  },
  data () {
    return {
      groupId: TAVERN_ID,
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
        gem: gemIcon,
        questIcon,
        challengeIcon,
        information: informationIcon,
        questBackground,
        upIcon,
        downIcon,
      }),
      group: {
        chat: [],
      },
      sections: {
        staff: true,
        helpfulLinks: true,
        playerTiers: true,
      },
      staff: [
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        // {
        //   name: 'lefnire',
        //   type: 'Staff',
        // },
        {
          name: 'Lemoness',
          type: 'Staff',
        },
        {
          name: 'paglias',
          type: 'Staff',
        },
        {
          name: 'redphoenix',
          type: 'Staff',
        },
        {
          name: 'SabreCat',
          type: 'Staff',
        },
        {
          name: 'TheHollidayInn',
          type: 'Staff',
        },
        {
          name: 'viirus',
          type: 'Staff',
        },
        {
          name: 'It\'s Bailey',
          type: 'Moderator',
        },
        {
          name: 'Alys',
          type: 'Moderator',
        },
        {
          name: 'Blade',
          type: 'Moderator',
        },
        {
          name: 'Breadstrings',
          type: 'Moderator',
        },
        {
          name: 'Cantras',
          type: 'Moderator',
        },
        // {
        //   name: 'Daniel the Bard',
        //   type: 'Moderator',
        // },
        {
          name: 'deilann 5.0.5b',
          type: 'Moderator',
        },
        {
          name: 'Dewines',
          type: 'Moderator',
        },
        {
          name: 'Fox_town',
          type: 'Moderator',
        },
        {
          name: 'Megan',
          type: 'Moderator',
        },
        {
          name: 'shanaqui',
          type: 'Moderator',
        },
      ],
      newMessage: '',
      coords: {
        TOP: 0,
        LEFT: 0,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    communityGuidelinesAccepted () {
      return this.user.flags.communityGuidelinesAccepted;
    },
  },
  async mounted () {
    this.group = await this.$store.dispatch('guilds:getGroup', {groupId: TAVERN_ID});
  },
  methods: {
    // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
    getCoord (e, text) {
      let carPos = text.selectionEnd;
      let div = document.createElement('div');
      let span = document.createElement('span');
      let copyStyle = getComputedStyle(text);

      [].forEach.call(copyStyle, (prop) => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      document.body.appendChild(div);
      div.textContent = text.value.substr(0, carPos);
      span.textContent = text.value.substr(carPos) || '.';
      div.appendChild(span);
      this.coords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    updateCarretPosition: debounce(function updateCarretPosition (eventUpdate) {
      this._updateCarretPosition(eventUpdate);
    }, 250),
    _updateCarretPosition (eventUpdate) {
      let text = eventUpdate.target;
      this.getCoord(eventUpdate, text);
    },
    selectedAutocomplete (newText) {
      this.newMessage = newText;
    },
    acceptCommunityGuidelines () {
      this.$store.dispatch('user:set', {'flags.communityGuidelinesAccepted': true});
    },
    toggleSleep () {
      this.user.preferences.sleep = !this.user.preferences.sleep;
      this.$store.dispatch('user:sleep');
    },
    async sendMessage () {
      let response = await this.$store.dispatch('chat:postChat', {
        group: this.group,
        message: this.newMessage,
      });
      this.group.chat.unshift(response.message);
      this.newMessage = '';

      // @TODO: I would like to not reload everytime we send. Realtime/Firebase?
      let chat = await this.$store.dispatch('chat:getChat', {groupId: this.group._id});
      this.group.chat = chat;
    },
    async fetchRecentMessages () {
      this.group = await this.$store.dispatch('guilds:getGroup', {groupId: TAVERN_ID});
    },
    reverseChat () {
      this.group.chat.reverse();
    },
  },
};
</script>
