<template lang="pug">
.row
  challenge-modal(:cloning='cloning' v-on:updatedChallenge='updatedChallenge')
  leave-challenge-modal(:challengeId='challenge._id')
  close-challenge-modal(:members='members', :challengeId='challenge._id')
  challenge-member-progress-modal(:memberId='progressMemberId', :challengeId='challenge._id')
  .col-12.col-md-8.standard-page
    .row
      .col-12.col-md-8
        h1(v-markdown='challenge.name')
        div
          strong(v-once) {{$t('createdBy')}}:
          span(v-if='challenge.leader && challenge.leader.profile') {{challenge.leader.profile.name}}
          // @TODO: make challenge.author a variable inside the createdBy string (helps with RTL languages)
          // @TODO: Implement in V2 strong.margin-left(v-once)
            .svg-icon.calendar-icon(v-html="icons.calendarIcon")
            | {{$t('endDate')}}
            // "endDate": "End Date: <% endDate %>",
          // span {{challenge.endDate}}
        .tags
          span.tag(v-for='tag in challenge.tags') {{tag}}
      .col-12.col-md-4
        .box(@click="showMemberModal()")
          .svg-icon.member-icon(v-html="icons.memberIcon")
          | {{challenge.memberCount}}
          .details(v-once) {{$t('participantsTitle')}}
        .box
          .svg-icon.gem-icon(v-html="icons.gemIcon")
          | {{challenge.prize}}
          .details(v-once) {{$t('prize')}}
    .row.challenge-actions
      .col-12.col-md-7.offset-md-5
        span.view-progress
          strong {{ $t('viewProgressOf') }}
        member-search-dropdown(:text="$t('selectParticipant')", :members='members', :challengeId='challengeId', @member-selected='openMemberProgressModal')
        span(v-if='isLeader || isAdmin')
          b-dropdown.create-dropdown(:text="$t('addTaskToChallenge')", :variant="'success'")
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
            @taskDestroyed='taskDestroyed'
          )
    .row
      task-column.col-12.col-sm-6(
        v-for="column in columns",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]',
        v-on:editTask="editTask",
        v-if='tasksByType[column].length > 0')
  .col-12.col-md-4.sidebar.standard-page
    .acitons
      div(v-if='canJoin')
        button.btn.btn-success(v-once, @click='joinChallenge()') {{$t('joinChallenge')}}
      div(v-if='isMember')
        button.btn.btn-danger(v-once, @click='leaveChallenge()') {{$t('leaveChallenge')}}
      div(v-if='isLeader || isAdmin')
        button.btn.btn-secondary(v-once, @click='edit()') {{$t('editChallenge')}}
      div(v-if='isLeader || isAdmin')
        button.btn.btn-danger(v-once, @click='closeChallenge()') {{$t('endChallenge')}}
      div(v-if='isLeader || isAdmin')
        button.btn.btn-secondary(v-once, @click='exportChallengeCsv()') {{$t('exportChallengeCsv')}}
      div(v-if='isLeader || isAdmin')
        button.btn.btn-secondary(v-once, @click='cloneChallenge()') {{$t('clone')}}
    .description-section
      h2 {{$t('challengeSummary')}}
      p(v-markdown='challenge.summary')
      h2 {{$t('challengeDescription')}}
      p(v-markdown='challenge.description')
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

  .challenge-actions {
    margin-top: 1em;

    .view-progress {
      margin-right: .5em;
    }
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
const TASK_KEYS_TO_REMOVE = ['_id', 'completed', 'date', 'dateCompleted', 'history', 'id', 'streak', 'createdAt', 'challenge'];

import Vue from 'vue';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import uuid from 'uuid';

import { mapState } from 'client/libs/store';
import memberSearchDropdown from 'client/components/members/memberSearchDropdown';
import closeChallengeModal from './closeChallengeModal';
import Column from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import markdownDirective from 'client/directives/markdown';
import challengeModal from './challengeModal';
import challengeMemberProgressModal from './challengeMemberProgressModal';
import challengeMemberSearchMixin from 'client/mixins/challengeMemberSearch';
import leaveChallengeModal from './leaveChallengeModal';

import taskDefaults from 'common/script/libs/taskDefaults';

import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';
import calendarIcon from 'assets/svg/calendar.svg';

export default {
  props: ['challengeId'],
  mixins: [challengeMemberSearchMixin],
  directives: {
    markdown: markdownDirective,
  },
  components: {
    closeChallengeModal,
    leaveChallengeModal,
    challengeModal,
    challengeMemberProgressModal,
    memberSearchDropdown,
    TaskColumn: Column,
    TaskModal,
  },
  data () {
    return {
      searchId: '',
      columns: ['habit', 'daily', 'todo', 'reward'],
      icons: Object.freeze({
        gemIcon,
        memberIcon,
        calendarIcon,
      }),
      cloning: false,
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
      searchTerm: '',
      memberResults: [],
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
    isAdmin () {
      return Boolean(this.user.contributor.admin);
    },
    canJoin () {
      return !this.isMember;
    },
  },
  mounted () {
    if (!this.searchId) this.searchId = this.challengeId;
    if (!this.challenge._id) this.loadChallenge();
  },
  async beforeRouteUpdate (to, from, next) {
    this.searchId = to.params.challengeId;
    await this.loadChallenge();

    if (this.$store.state.challengeOptions.cloning) {
      this.cloneTasks(this.$store.state.challengeOptions.tasksToClone);
    }
    next();
  },
  methods: {
    cleanUpTask (task) {
      let cleansedTask = omit(task, TASK_KEYS_TO_REMOVE);

      // Copy checklists but reset to uncomplete and assign new id
      if (!cleansedTask.checklist) cleansedTask.checklist = [];
      cleansedTask.checklist.forEach((item) => {
        item.completed = false;
        item.id = uuid();
      });

      if (cleansedTask.type !== 'reward') {
        delete cleansedTask.value;
      }

      return cleansedTask;
    },
    cloneTasks (tasksToClone) {
      let clonedTasks = [];

      for (let key in tasksToClone) {
        let tasksSection = tasksToClone[key];
        tasksSection.forEach(task => {
          let clonedTask = cloneDeep(task);
          clonedTask = this.cleanUpTask(clonedTask);
          clonedTask = taskDefaults(clonedTask);
          this.tasksByType[task.type].push(clonedTask);
          clonedTasks.push(clonedTask);
        });
      }

      this.$store.dispatch('tasks:createChallengeTasks', {
        challengeId: this.searchId,
        tasks: clonedTasks,
      });

      this.$store.state.challengeOptions.cloning = false;
      this.$store.state.challengeOptions.tasksToClone = [];
    },
    async loadChallenge () {
      this.challenge = await this.$store.dispatch('challenges:getChallenge', {challengeId: this.searchId});
      this.members = await this.$store.dispatch('members:getChallengeMembers', {challengeId: this.searchId});
      let tasks = await this.$store.dispatch('tasks:getChallengeTasks', {challengeId: this.searchId});
      this.tasksByType = {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      };
      tasks.forEach((task) => {
        this.tasksByType[task.type].push(task);
      });
    },
    editTask (task) {
      this.taskFormPurpose = 'edit';
      this.editingTask = cloneDeep(task);
      this.workingTask = this.editingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
    createTask (type) {
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({type, text: ''});
      this.workingTask = this.creatingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
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
    taskDestroyed (task) {
      let index = findIndex(this.tasksByType[task.type], (taskItem) => {
        return taskItem._id === task._id;
      });
      this.tasksByType[task.type].splice(index, 1);
    },
    showMemberModal () {
      this.$store.state.memberModalOptions.challengeId = this.challenge._id;
      this.$store.state.memberModalOptions.groupId = 'challenge'; // @TODO: change these terrible settings
      this.$store.state.memberModalOptions.group = this.group;
      this.$store.state.memberModalOptions.viewingMembers = this.members;
      this.$root.$emit('bv::show::modal', 'members-modal');
    },
    async joinChallenge () {
      this.user.challenges.push(this.searchId);
      await this.$store.dispatch('challenges:joinChallenge', {challengeId: this.searchId});
      await this.$store.dispatch('tasks:fetchUserTasks', {forceLoad: true});
    },
    async leaveChallenge () {
      this.$root.$emit('bv::show::modal', 'leave-challenge-modal');
    },
    closeChallenge () {
      this.$root.$emit('bv::show::modal', 'close-challenge-modal');
    },
    edit () {
      // @TODO: set working challenge
      this.cloning = false;
      this.$store.state.challengeOptions.workingChallenge = Object.assign({}, this.$store.state.challengeOptions.workingChallenge, this.challenge);
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
    // @TODO: view members
    updatedChallenge (eventData) {
      Object.assign(this.challenge, eventData.challenge);
    },
    openMemberProgressModal (member) {
      this.progressMemberId = member._id;
      this.$root.$emit('bv::show::modal', 'challenge-member-modal');
    },
    async exportChallengeCsv () {
      // let response = await this.$store.dispatch('challenges:exportChallengeCsv', {
      //   challengeId: this.searchId,
      // });
      window.location = `/api/v3/challenges/${this.searchId}/export/csv`;
    },
    cloneChallenge () {
      this.cloning = true;
      this.$store.state.challengeOptions.tasksToClone = this.tasksByType;
      this.$store.state.challengeOptions.workingChallenge = Object.assign({}, this.$store.state.challengeOptions.workingChallenge, this.challenge);
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
  },
};
</script>
