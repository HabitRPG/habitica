<template lang="pug">
.row
  challenge-modal(:challenge='challenge')
  close-challenge-modal

  .col-8.standard-page
    .row
      .col-8
        h1 {{challenge.name}}
        div
          strong(v-once) {{$t('createdBy')}}
          span {{challenge.author}}
          strong.margin-left(v-once)
            .svg-icon.calendar-icon(v-html="icons.calendarIcon")
            | {{$t('endDate')}}
          span {{challenge.endDate}}
        .tags
          span.tag(v-for='tag in challenge.tags') {{tag}}
      .col-4
        .box
          .svg-icon.member-icon(v-html="icons.memberIcon")
          | {{challenge.memberCount}}
          .details(v-once) {{$t('participants')}}
        .box
          .svg-icon.gem-icon(v-html="icons.gemIcon")
          | {{challenge.prize}}
          .details(v-once) {{$t('prize')}}
    .row
      task-column.col-6(v-for="column in columns", :type="column", :key="column")
  .col-4.sidebar.standard-page
    .acitons
      div(v-if='!isMember && !isLeader')
        button.btn.btn-success(v-once) {{$t('joinChallenge')}}
      div(v-if='isMember')
        button.btn.btn-danger(v-once) {{$t('leaveChallenge')}}
      div(v-if='isLeader')
        button.btn.btn-success(v-once) {{$t('addTask')}}
      div(v-if='isLeader')
        button.btn.btn-secondary(v-once, @click='edit()') {{$t('editChallenge')}}
      div(v-if='isLeader')
        button.btn.btn-danger(v-once, @click='closeChallenge()') {{$t('endChallenge')}}
    .description-section
      h2(v-once) {{$t('challengeDescription')}}
      p {{challenge.description}}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  h1 {
    color: $purple-200;
  }

  .margin-left {
    margin-left: 1em;
  }

  span {
    margin-left: .5em;
  }

  .calendar-icon {
    width: 12px;
    display: inline-block;
    margin-right: .2em;
  }

  .tags {
    margin-top: 1em;
  }

  .tag {
    border-radius: 30px;
    background-color: $gray-600;
    padding: .5em;
  }

  .sidebar {
    background-color: $gray-600;
  }

  .box {
    display: inline-block;
    padding: 1em;
    border-radius: 2px;
    background-color: $white;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    margin-left: 1em;
    width: 120px;
    height: 76px;
    text-align: center;
    font-size: 20px;
    vertical-align: bottom;

    .svg-icon {
      width: 30px;
      display: inline-block;
      margin-right: .2em;
      vertical-align: bottom;
    }

    .details {
      font-size: 12px;
      margin-top: 0.4em;
      color: $gray-200;
    }
  }

  .acitons {
    width: 100%;

    div, button {
      width: 60%;
      margin: 0 auto;
      text-align: center;
    }
  }

  .description-section {
    margin-top: 2em;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import closeChallengeModal from './closeChallengeModal';
import Column from '../tasks/column';
import challengeModal from './challengeModal';

import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';
import calendarIcon from 'assets/svg/calendar.svg';

export default {
  props: ['challengeId'],
  components: {
    closeChallengeModal,
    challengeModal,
    TaskColumn: Column,
  },
  data () {
    return {
      columns: ['habit', 'daily', 'todo', 'reward'],
      icons: Object.freeze({
        gemIcon,
        memberIcon,
        calendarIcon,
      }),
      challenge: {
        // _id: 1,
        // title: 'I am the Night! (Official TAKE THIS Challenge June 2017)',
        // memberCount: 5261,
        // endDate: '2017-04-04',
        // tags: ['Habitica Official', 'Tag'],
        // prize: 10,
        // description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium.',
        // counts: {
        //   habit: 0,
        //   dailies: 2,
        //   todos: 2,
        //   rewards: 0,
        // },
        // author: 'SabreCat',
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.user.challenges.indexOf(this.challenge._id) !== -1;
    },
    isLeader () {
      return true;
    },
  },
  mounted () {
    this.getChallenge();
  },
  methods: {
    async getChallenge () {
      this.challenge = await this.$store.dispatch('challenges:getChallenge', {challengeId: this.challengeId});
    },
    async joinChallenge () {
      // this.challenge = this.$store.dispatch('challenges:joinChallenge', {challengeId: this.challengeId});
    },
    async leaveChallenge () {
      // this.challenge = this.$store.dispatch('challenges:leaveChallenge', {challengeId: this.challengeId});
    },
    closeChallenge () {
      this.$root.$emit('show::modal', 'close-challenge-modal');
    },
    edit () {
      // @TODO: set working challenge
      this.$root.$emit('show::modal', 'challenge-modal');
    },
    // @TODO: view members
  },
};
</script>
