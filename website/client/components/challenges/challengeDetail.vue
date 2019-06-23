<template lang="pug">
.row
  challenge-modal(@updatedChallenge='updatedChallenge')
  leave-challenge-modal(:challengeId='challenge._id')
  close-challenge-modal(:members='members', :challengeId='challenge._id', :prize='challenge.prize')
  challenge-member-progress-modal(:challengeId='challenge._id')
  .col-12.col-md-8.standard-page
    .row
      .col-12.col-md-6
        h1(v-markdown='challenge.name')
        div
          span.mr-1.ml-0.d-block
            strong(v-once) {{ $t('createdBy') }}:
            user-link.mx-1(:user="challenge.leader")
          span.mr-1.ml-0.d-block(v-if="challenge.group && challenge.group.name !== 'Tavern'")
            strong(v-once) {{ $t(challenge.group.type) }}:
            group-link.mx-1(:group="challenge.group")
          // @TODO: make challenge.author a variable inside the createdBy string (helps with RTL languages)
          // @TODO: Implement in V2 strong.margin-left(v-once)
            .svg-icon.calendar-icon(v-html="icons.calendarIcon")
            | {{$t('endDate')}}
            // "endDate": "End Date: <% endDate %>",
          // span {{challenge.endDate}}
        .tags
          span.tag(v-for='tag in challenge.tags') {{tag}}
      .col-12.col-md-6.text-right
        .box(@click="showMemberModal()")
          .svg-icon.member-icon(v-html="icons.memberIcon")
          | {{challenge.memberCount}}
          .details(v-once) {{$t('participantsTitle')}}
        .box
          .svg-icon.gem-icon(v-html="icons.gemIcon")
          | {{challenge.prize}}
          .details(v-once) {{$t('prize')}}
    .row.challenge-actions
      .col-12.col-md-6
        strong.view-progress {{ $t('viewProgressOf') }}
        member-search-dropdown(:text="$t('selectParticipant')", :members='members', :challengeId='challengeId', @member-selected='openMemberProgressModal')
      .col-12.col-md-6.text-right
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
            @taskCreated='taskCreated',
            @taskEdited='taskEdited',
            @taskDestroyed='taskDestroyed'
          )
    .row
      task-column.col-12.col-sm-6(
        v-for="column in columns",
        :type="column",
        :key="column",
        :taskListOverride='tasksByType[column]',
        @editTask="editTask",
        @taskDestroyed="taskDestroyed",
        v-if='tasksByType[column].length > 0')
  .col-12.col-md-4.sidebar.standard-page
    .button-container(v-if='canJoin')
      button.btn.btn-success(v-once, @click='joinChallenge()') {{$t('joinChallenge')}}
    .button-container(v-if='isLeader || isAdmin')
      button.btn.btn-primary(v-once, @click='edit()') {{$t('editChallenge')}}
    .button-container(v-if='isLeader || isAdmin')
      button.btn.btn-primary(v-once, @click='cloneChallenge()') {{$t('clone')}}
    .button-container(v-if='isLeader || isAdmin')
      button.btn.btn-primary(v-once, @click='exportChallengeCsv()') {{$t('exportChallengeCsv')}}
    .button-container(v-if='isLeader || isAdmin')
      button.btn.btn-danger(v-once, @click='closeChallenge()') {{$t('endChallenge')}}
    div
      sidebar-section(:title="$t('challengeSummary')")
        p(v-markdown='challenge.summary')
      sidebar-section(:title="$t('challengeDescription')")
        p(v-markdown='challenge.description')
    .text-center(v-if='isMember')
      button.btn.btn-danger(v-once, @click='leaveChallenge()') {{$t('leaveChallenge')}}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  h1 {
    color: $purple-200;
    margin-bottom: 8px;
  }

  .margin-left {
    margin-left: 1em;
  }

  span {
    margin-left: .5em;
  }

  .button-container {
    margin-bottom: 1em;

    button {
      width: 100%;
    }
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

  .description-section {
    margin-top: 2em;
  }

  .challenge-actions {
    margin-top: 1em;
    margin-bottom: 2em;

    .view-progress {
      margin-right: .5em;
    }
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
import sidebarSection from '../sidebarSection';
import userLink from '../userLink';
import groupLink from '../groupLink';
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
    sidebarSection,
    TaskColumn: Column,
    TaskModal,
    userLink,
    groupLink,
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
    async loadChallenge () {
      this.challenge = await this.$store.dispatch('challenges:getChallenge', {challengeId: this.searchId});
      this.members = await this.loadMembers({ challengeId: this.searchId, includeAllPublicFields: true });
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

    /**
     * Method for loading members of a group, with optional parameters for
     * modifying requests.
     *
     * @param {Object}  payload     Used for modifying requests for members
     */
    loadMembers (payload = null) {
      // Remove unnecessary data
      if (payload && payload.groupId) {
        delete payload.groupId;
      }
      return this.$store.dispatch('members:getChallengeMembers', payload);
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
      this.creatingTask = taskDefaults({type, text: ''}, this.user);
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
      this.$root.$emit('habitica:show-member-modal', {
        challengeId: this.challenge._id,
        groupId: 'challenge', // @TODO: change these terrible settings
        group: this.challenge.group,
        memberCount: this.challenge.memberCount,
        viewingMembers: this.members,
        fetchMoreMembers: this.loadMembers,
      });
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
      this.$root.$emit('habitica:update-challenge', {
        challenge: this.challenge,
      });
    },
    // @TODO: view members
    updatedChallenge (eventData) {
      Object.assign(this.challenge, eventData.challenge);
    },
    openMemberProgressModal (member) {
      this.$root.$emit('habitica:challenge:member-progress', {
        progressMemberId: member._id,
        isLeader: this.isLeader,
        isAdmin: this.isAdmin,
      });
    },
    async exportChallengeCsv () {
      // let response = await this.$store.dispatch('challenges:exportChallengeCsv', {
      //   challengeId: this.searchId,
      // });
      window.location = `/api/v4/challenges/${this.searchId}/export/csv`;
    },
    cloneChallenge () {
      this.$root.$emit('habitica:clone-challenge', {
        challenge: this.challenge,
      });
    },
  },
};
</script>
