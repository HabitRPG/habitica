<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
.row(v-if="guild")
  .clearfix.col-8
    .row
      .col-6
        .float-left
          h2 {{guild.name}}
          strong.float-left {{$t('groupLeader')}}
          span.float-left : {{guild.leader.profile.name}}
      .col-6
        .float-right
          .row.icon-row
            .col-6
              img.icon.shield(src="~assets/guilds/gold-guild-badge.svg")
              | {{guild.memberCount}}
              div {{$t('members')}}
            .col-6
              .item-with-icon
                img.icon.gem(src="~assets/header/png/gem@3x.png")
              | {{guild.memberCount}}
              div {{$t('members')}}
    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}

        textarea

        div.hr
          div.hr-middle
            | Today

        .card(v-for="msg in guild.chat", :key="msg.id")
          .card-block
            h3 Character name
            span 2 hours ago
            .clearfix
              strong.float-left {{msg.user}}
              .float-right {{msg.timestamp}}
            .text {{msg.text}}

  .col-md-4
    .guild-background.row
      .col-6
        p Image here
      .col-6
        button.btn.btn-primary Join Guild
        br
        button.btn.float-left(:class="[isMember ? 'btn-danger' : 'btn-success']") {{ isMember ? $t('leave') : $t('join') }}
        br
        button.btn.btn-purple Invite to Guild
        br
        button.btn.btn-purple Message Guild Leader
        br
        button.btn.btn-purple Donate Gems
    div
      h3(v-once) {{ $t('description') }}
      p {{ guild.description }}
      p Life hacks are tricks, shortcuts, or methods that help increase productivity, efficiency, health, and so on. Generally, they get you to a better state of life. Life hacking is the process of utilizing and implementing these secrets. And, in this guild, we want to help everyone discover these improved ways of doing things.
    div
      h3 Guild Information
      h4 Welcome
      p Below are some resources that some members might find useful. Consider checking them out before posting any questions, as they just might help answer some of them! Feel free to share your life hacks in the guild chat, or ask any questions that you might have. Please peruse at your leisure, and remember: this guild is meant to help guide you in the right direction. Only you will know what works best for you.
    div
      h3 Challenges
      .card
        h4 Challenge
        .row
          .col-8
            p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque ultrices libero.
          .col-4
        .row
          .col-md-12
            span Tag
            span 100
</template>

<style lang="scss" scoped>
  .card {
    margin: 2em 0;
    padding: 1em;
  }

  .guild-background {
    background-image: linear-gradient(to bottom, rgba(237, 236, 238, 0), #edecee);
    height: 300px;
  }

  textarea {
    height: 150px;
    width: 100%;
    border-radius: 2px;
    background-color: #ffffff;
    border: solid 1px #c3c0c7;
  }

  .icon.shield, .icon.gem {
    width: 40px;
    margin-right: 1em;
  }

  .icon-row {
    margin-top: 1.5em;
  }

  .chat-row {
    margin-top: 2em;
  }

  .hr {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid #e1e0e3;
    text-align: center;
  }

  .hr-middle {
    font-size: 16px;
    font-weight: bold;
    font-stretch: condensed;
    line-height: 1.5;
    text-align: center;
    color: #878190;
    background-color: #f9f9f9;
    padding: .2em;
    margin-top: .2em;
    display: inline-block;
    width: 100px;
  }
</style>

<script>
import axios from 'axios';
import groupUtilities from 'client/mixins/groupsUtilities';
import { mapState } from 'client/libs/store';

export default {
  mixins: [groupUtilities],
  props: ['guildId'],
  data () {
    return {
      guild: null,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
  created () {
    this.fetchGuild();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
  },
  methods: {
    fetchGuild () {
      axios.get(`/api/v3/groups/${this.guildId}`).then(response => {
        this.guild = response.data.data;
        this.guild.chat = [
          {
            text: '@CharacterName Vestibulum ultricies, lorem non bibendum consequat, nisl lacus semper nulla, hendrerit dignissim ipsum erat eu odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at aliquet urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla non est ut nisl interdum tincidunt in eu dui. Proin condimentum a.',
          }
        ]
      });
    },
  },
};
</script>
