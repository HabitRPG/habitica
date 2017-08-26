<template lang="pug">
.row
  challenge-modal(:challenge='challenge', v-on:updatedChallenge='updatedChallenge')
  close-challenge-modal(:members='members', :challengeId='challenge._id')
  challenge-member-progress-modal(:memberId='progressMemberId', :challengeId='challenge._id')

  .col-8.standard-page
    .row
      .col-8
        h1 {{challenge.name}}
        div
          strong(v-once) {{$t('createdBy')}}:
          span {{challenge.author}}
          // @TODO: make challenge.author a variable inside the createdBy string (helps with RTL languages)
          // @TODO: Implement in V2 strong.margin-left(v-once)
            .svg-icon.calendar-icon(v-html="icons.calendarIcon")
            | {{$t('endDate')}}
            // "endDate": "End Date: <% endDate %>",
          span {{challenge.endDate}}
        .tags
          span.tag(v-for='tag in challenge.tags') {{tag}}
      .col-4
        .box(@click="showMemberModal()")
          .svg-icon.member-icon(v-html="icons.memberIcon")
          | {{challenge.memberCount}}
          .details(v-once) {{$t('participantsTitle')}}
        .box
          .svg-icon.gem-icon(v-html="icons.gemIcon")
          | {{challenge.prize}}
          .details(v-once) {{$t('prize')}}
    .row(v-if='isLeader')
      .col-6.offset-6
        span
          strong View Progress Of
        b-dropdown.create-dropdown(text="Select a Participant")
          b-dropdown-item(v-for="member in members", :key="member._id", @click="openMemberProgressModal(member._id)")
            | {{ member.profile.name }}

    .row
      task-column.col-6(
        v-for="column in columns",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]',
        v-on:editTask="editTask")
  .col-4.sidebar.standard-page
    .acitons
      div(v-if='!isMember && !isLeader')
        button.btn.btn-success(v-once, @click='joinChallenge()') {{$t('joinChallenge')}}
      div(v-if='isMember')
        button.btn.btn-danger(v-once, @click='leaveChallenge()') {{$t('leaveChallenge')}}
      div(v-if='isLeader')
        b-dropdown.create-dropdown(:text="$t('create')")
          b-dropdown-item(v-for="type in columns", :key="type", @click="createTask(type)")
            | {{$t(type)}}
        task-modal(
          :task="workingTask",
          :purpose="taskFormPurpose",
          @cancel="cancelTaskModal()",
          ref="taskModal",
          :challengeId="challengeId",
          v-on:taskCreated='taskCreated',
          v-on:taskEdited='taskEdited',
        )
      div(v-if='isLeader')
        button.btn.btn-secondary(v-once, @click='edit()') {{$t('editChallenge')}}
      div(v-if='isLeader')
        button.btn.btn-danger(v-once, @click='closeChallenge()') {{$t('endChallenge')}}
    .description-section
      h2 {{$t('challengeSummary')}}
      p {{challenge.summary}}
      h2 {{$t('challengeDescription')}}
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
      margin-bottom: .5em;
      text-align: center;
    }
  }

  .description-section {
    margin-top: 2em;
  }
</style>

<style>
  .create-dropdown button {
    width: 100%;
    font-size: 16px !important;
    font-weight: bold !important;
  }
</style>

<script>
import Vue from 'vue';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';

import { mapState } from 'client/libs/store';
import closeChallengeModal from './closeChallengeModal';
import Column from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import challengeModal from './challengeModal';
import challengeMemberProgressModal from './challengeMemberProgressModal';

import taskDefaults from 'common/script/libs/taskDefaults';

import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';
import calendarIcon from 'assets/svg/calendar.svg';

export default {
  props: ['challengeId'],
  components: {
    closeChallengeModal,
    challengeModal,
    challengeMemberProgressModal,
    TaskColumn: Column,
    TaskModal,
    bDropdown,
    bDropdownItem,
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
      members: [],
      tasksByType: {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      },
      editingTask: {},
      creatingTask: {},
      workingTask: {},
      taskFormPurpose: 'create',
      progressMemberId: '',
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.user.challenges.indexOf(this.challenge._id) !== -1;
    },
    isLeader () {
      if (!this.challenge.leader) return false;
      return this.user._id === this.challenge.leader._id;
    },
  },
  async mounted () {
    this.challenge = await this.$store.dispatch('challenges:getChallenge', {challengeId: this.challengeId});
    this.members = await this.$store.dispatch('members:getChallengeMembers', {challengeId: this.challengeId});
    let tasks = await this.$store.dispatch('tasks:getChallengeTasks', {challengeId: this.challengeId});
    tasks.forEach((task) => {
      this.tasksByType[task.type].push(task);
    });
  },
  methods: {
    editTask (task) {
      this.taskFormPurpose = 'edit';
      this.editingTask = cloneDeep(task);
      this.workingTask = this.editingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
      });
    },
    createTask (type) {
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({type, text: ''});
      this.workingTask = this.creatingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
      });
    },
    cancelTaskModal () {
      this.editingTask = null;
      this.creatingTask = null;
    },
    taskCreated (task) {
      this.tasksByType[task.type].push(task);
    },
    taskEdited (task) {
      let index = findIndex(this.tasksByType[task.type], (taskItem) => {
        return taskItem._id === task._id;
      });
      this.tasksByType[task.type].splice(index, 1, task);
    },
    showMemberModal () {
      this.$store.state.memberModalOptions.groupId = 'challenge'; // @TODO: change these terrible settings
      this.$store.state.memberModalOptions.group = this.group;
      this.$store.state.memberModalOptions.viewingMembers = this.members;
      this.$root.$emit('show::modal', 'members-modal');
    },
    async joinChallenge () {
      this.user.challenges.push(this.challengeId);
      await this.$store.dispatch('challenges:joinChallenge', {challengeId: this.challengeId});
      // @TODO: this doesn't work because of asyncresource
      let tasks = await this.$store.dispatch('tasks:fetchUserTasks');
      this.$store.state.tasks.data = tasks.data;
    },
    async leaveChallenge () {
      let keepChallenge = confirm('Do you want to keep challenge tasks?');
      let keep = 'keep-all';
      if (!keepChallenge) keep = 'remove-all';

      let index = findIndex(this.user.challenges, (challengeId) => {
        return challengeId === this.challengeId;
      });
      this.user.challenges.splice(index, 1);
      await this.$store.dispatch('challenges:leaveChallenge', {
        challengeId: this.challengeId,
        keep,
      });
    },
    closeChallenge () {
      this.$root.$emit('show::modal', 'close-challenge-modal');
    },
    edit () {
      // @TODO: set working challenge
      this.$root.$emit('show::modal', 'challenge-modal');
    },
    // @TODO: view members
    updatedChallenge (eventData) {
      Object.assign(this.challenge, eventData.challenge);
    },
    openMemberProgressModal (memberId) {
      this.progressMemberId = memberId;
      this.$root.$emit('show::modal', 'challenge-member-modal');
    },
  },
};
</script>
