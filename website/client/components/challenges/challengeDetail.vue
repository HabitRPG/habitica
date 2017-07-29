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
        button.btn.btn-success(v-once, @click='joinChallenge()') {{$t('joinChallenge')}}
      div(v-if='isMember')
        button.btn.btn-danger(v-once, @click='leaveChallenge()') {{$t('leaveChallenge')}}
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
import findIndex from 'lodash/findIndex';

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
      challenge: {},
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.user.challenges.indexOf(this.challenge._id) !== -1;
    },
    isLeader () {
      if (!this.leader) return false;
      return this.user._id === this.leader.id;
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
      this.user.challenges.push(this.challengeId);
      await this.$store.dispatch('challenges:joinChallenge', {challengeId: this.challengeId});
    },
    async leaveChallenge () {
      let index = findIndex(this.user.challenges, (challengeId) => {
        return challengeId === this.challengeId;
      });
      this.user.challenges.splice(index, 1);
      await this.$store.dispatch('challenges:leaveChallenge', {challengeId: this.challengeId});
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
