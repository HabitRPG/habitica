<template lang="pug">
.row
  .clearfix.col-8.standard-page
    .row
      .col-6.title-details
        h1 Welcome to The Tavern!

    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}

        textarea(:placeholder="$t('chatPlaceHolder')")
        button.btn.btn-secondary.send-chat.float-right(v-once) {{ $t('send') }}

        .container.community-guidelines(v-if='communityGuidelinesAccepted')
          .row
            div.col-8
              | Habitica tries to create a welcoming environment for users of all ages and backgrounds, especially in public spaces like the Tavern. If you have any questions, please consult our Community Guidelines.
            div.col-4
              button.btn.btn-info I agree to follow the Community Guidelines

        .hr
          .hr-middle(v-once) {{ $t('today') }}

        .row
          .col-md-2
            .svg-icon(v-html="icons.like")
          .col-md-10
            .card(v-for="msg in group.chat", :key="msg.id")
              .card-block
                h3.leader Character name
                span 2 hours ago
                .clearfix
                  strong.float-left {{msg.user}}
                  .float-right {{msg.timestamp}}
                .text {{msg.text}}
                hr
                span.action(v-once)
                  .svg-icon(v-html="icons.like")
                  | {{$t('like')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.copy")
                  | {{$t('copyAsTodo')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.report")
                  | {{$t('report')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.delete")
                  | {{$t('delete')}}
                span.action.float-right
                  .svg-icon(v-html="icons.liked")
                  | +3


  .col-md-4.sidebar
    .section
      .grassy-meadow-backdrop
      strong Need a break? Check into Daniel’s Inn to pause some of Habitica’s more difficult game mechanics:
      ul
        li Missed Dailies won’t damage you
        li Tasks won’t lose streaks or decay in color
        li Bosses won’t do damage for your missed Dailies
        li Your boss damage or collection Quest items will stay pending until check-out
      button.btn.btn-secondary.pause-button Pause Damage

    .section-header
      .row
        .col-10
          h3(v-once) Staff and Moderators
        .col-2
          .toggle-up(@click="sections.staff = !sections.staff", v-if="sections.staff")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.staff = !sections.staff", v-if="!sections.staff")
            .svg-icon(v-html="icons.downIcon")
      .section.row(v-if="sections.staff")
        .col-3.staff(v-for='user in staff')
          .title {{user.name}}
          .type {{user.type}}

    .section-header
      .row
        .col-10
          h3(v-once) Helpful Links
        .col-2
          .toggle-up(@click="sections.staff = !sections.staff", v-if="sections.staff")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.staff = !sections.staff", v-if="!sections.staff")
            .svg-icon(v-html="icons.downIcon")
      .section.row(v-if="sections.staff")
        ul
          li
            a(herf='') Community Guidelines
          li
            a(herf='') Looking for Group (Party Wanted) Posts
          li
            a(herf='') FAQ
          li
            a(herf='') Glossary
          li
            a(herf='') Wiki
          li
            a(herf='') Data Display Tool
          li
            a(herf='') Report a Problem
          li
            a(herf='') Request a Feature
          li
            a(herf='') Community Forum
          li
            a(herf='') Ask a Question (Habitica Help guild)

    .section-header
      .row
        .col-10
          h3(v-once) Player Tiers
        .col-2
          .toggle-up(@click="sections.staff = !sections.staff", v-if="sections.staff")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.staff = !sections.staff", v-if="!sections.staff")
            .svg-icon(v-html="icons.downIcon")
      .section.row(v-if="sections.staff")
        .col-12
          p The colored usernames you see in chat represent a person’s contributor tier. The higher the tier, the more the person has contributed to habitica through art, code, the community, or more!
          ul.tier-list
            li Tier 1 (Friend)
            li Tier 2 (Friend)
            li Tier 3 (Elite)
            li Tier 4 (Elite)
            li Tier 5 (Champion)
            li Tier 6 (Champion)
            li Tier 7 (Legendary)
            li Moderator (Guardian)
            li Staff (Heroic)
            li NPC
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  // @TODO: Move chat to component
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
      width: 98%;
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
    padding-top: 2em;
  }

  .toggle-up, .toggle-down {
    width: 20px;
  }

  .toggle-up:hover, .toggle-down:hover {
    cursor: pointer;
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
    background-image: url('~assets/images/groups/grassy-meadow-backdrop.png');
    width: 472px;
    height: 246px;
  }

  .staff {
    margin-bottom: 1em;

    .title {
      color: #6133b4;
      font-weight: bold;
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
    }
  }

</style>

<script>
import { mapState } from 'client/libs/store';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import gemIcon from 'assets/svg/gem.svg';
import questIcon from 'assets/svg/quest.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import informationIcon from 'assets/svg/information.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        gem: gemIcon,
        liked: likedIcon,
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
      },
      staff: [
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
        {
          name: 'beffymaroo',
          type: 'Staff',
        },
      ],
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    communityGuidelinesAccepted () {
      return true;
      // return user.flags.communityGuidelinesAccepted;
    },
  },
  mounted () {
    // @TODO: Load tavern
  },
  methods: {
    aggreeToGuideLines () {
      // @TODO:
    },
    pauseDailies () {
      // @TODO:
    },
  },
};
</script>
