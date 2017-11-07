<template lang="pug">
  form(v-if="task", @submit.stop.prevent="submit()")
    b-modal#task-modal(size="sm", @hidden="onClose()")
      .task-modal-header(slot="modal-header", :class="[cssClass]")
        .clearfix
          h1.float-left {{ title }}
          .float-right.d-flex.align-items-center
            span.cancel-task-btn.mr-2(v-if="purpose !== 'create'", v-once, @click="cancel()") {{ $t('cancel') }}
            button.btn.btn-secondary(type="submit", v-once) {{ $t('save') }}
        .form-group
          label(v-once) {{ `${$t('text')}*` }}
          input.form-control.title-input(
            type="text", :class="[`${cssClass}-modal-input`]",
            required, v-model="task.text",
            autofocus, spellcheck="true",
          )
        .form-group
          label(v-once) {{ $t('notes') }}
          textarea.form-control(:class="[`${cssClass}-modal-input`]", v-model="task.notes", rows="3")
      .task-modal-content
        .option(v-if="task.type === 'reward'")
          label(v-once) {{ $t('cost') }}
          input(type="number", v-model="task.value", required, min="0")
          .svg-icon.gold(v-html="icons.gold")
        .option(v-if="checklistEnabled")
          label(v-once) {{ $t('checklist') }}
          br
          div(v-sortable='true', @onsort='sortedChecklist')
            .inline-edit-input-group.checklist-group.input-group(v-for="(item, $index) in checklist")
              span.grippy
              input.inline-edit-input.checklist-item.form-control(type="text", v-model="item.text")
              span.input-group-btn(@click="removeChecklistItem($index)")
                .svg-icon.destroy-icon(v-html="icons.destroy")
          input.inline-edit-input.checklist-item.form-control(type="text", :placeholder="$t('newChecklistItem')", @keydown.enter="addChecklistItem($event)", v-model="newChecklistItem")
        .d-flex.justify-content-center(v-if="task.type === 'habit'")
          .option-item(:class="optionClass(task.up === true)", @click="task.up = !task.up")
            .option-item-box
              .task-control.habit-control(:class="controlClass.up + '-control-habit'")
                .svg-icon.positive(v-html="icons.positive")
            .option-item-label(v-once) {{ $t('positive') }}
          .option-item(:class="optionClass(task.down === true)", @click="task.down = !task.down")
            .option-item-box
              .task-control.habit-control(:class="controlClass.down + '-control-habit'")
                .svg-icon.negative(v-html="icons.negative")
            .option-item-label(v-once) {{ $t('negative') }}
        template(v-if="task.type !== 'reward'")
          label(v-once)
            span.float-left {{ $t('difficulty') }}
            // @TODO .svg-icon.info-icon(v-html="icons.information")
          .d-flex.justify-content-center
            .option-item(:class="optionClass(task.priority === 0.1)", @click="task.priority = 0.1")
              .option-item-box
                .svg-icon.difficulty-trivial-icon(v-html="icons.difficultyTrivial")
              .option-item-label(v-once) {{ $t('trivial') }}
            .option-item(:class="optionClass(task.priority === 1)", @click="task.priority = 1")
              .option-item-box
                .svg-icon.difficulty-normal-icon(v-html="icons.difficultyNormal")
              .option-item-label(v-once) {{ $t('easy') }}
            .option-item(:class="optionClass(task.priority === 1.5)", @click="task.priority = 1.5")
              .option-item-box
                .svg-icon.difficulty-medium-icon(v-html="icons.difficultyMedium")
              .option-item-label(v-once) {{ $t('medium') }}
            .option-item(:class="optionClass(task.priority === 2)", @click="task.priority = 2")
              .option-item-box
                .svg-icon.difficulty-hard-icon(v-html="icons.difficultyHard")
              .option-item-label(v-once) {{ $t('hard') }}
        .option(v-if="task.type === 'todo'")
          label(v-once) {{ $t('dueDate') }}
          datepicker(
            v-model="task.date",
            :clearButton='true',
            clearButtonIcon='category-select',
            :clearButtonText='$t("clear")',
            :todayButton='true',
            todayButtonIcon='category-select',
            :todayButtonText='$t("today")',
          )
        .option(v-if="task.type === 'daily'")
          label(v-once) {{ $t('startDate') }}
          datepicker(
            v-model="task.startDate",
            :clearButton='false',
            :todayButton='true',
            todayButtonIcon='category-select',
            :todayButtonText='$t("today")',
          )
        .option(v-if="task.type === 'daily'")
          .form-group
            label(v-once) {{ $t('repeats') }}
            b-dropdown(:text="$t(task.frequency)")
              b-dropdown-item(v-for="frequency in ['daily', 'weekly', 'monthly', 'yearly']", :key="frequency", @click="task.frequency = frequency", :class="{active: task.frequency === frequency}")
                | {{ $t(frequency) }}
          .form-group
            label(v-once) {{ $t('repeatEvery') }}
            input(type="number", v-model="task.everyX", min="0", required)
            | {{ repeatSuffix }}
            br
          template(v-if="task.frequency === 'daily'")
            .form-check
              label.custom-control.custom-checkbox
                input.custom-control-input(type="checkbox", v-model="task.repeatAfterCompletion")
                span.custom-control-indicator
                span.custom-control-description {{ $t('repeatAfterCompletionTitle', {everyX: task.everyX}) }}
          template(v-if="task.frequency === 'weekly'")
            .form-check-inline.weekday-check(
              v-for="(day, dayNumber) in ['su','m','t','w','th','f','s']",
              :key="dayNumber",
            )
              label.custom-control.custom-checkbox
                input.custom-control-input(type="checkbox", v-model="task.repeat[day]")
                span.custom-control-indicator
                span.custom-control-description(v-once) {{ weekdaysMin(dayNumber) }}
          template(v-if="task.frequency === 'monthly'")
            label.custom-control.custom-radio
              input.custom-control-input(type='radio', v-model="repeatsOn", value="dayOfMonth")
              span.custom-control-indicator
              span.custom-control-description {{ $t('dayOfMonth') }}
            label.custom-control.custom-radio
              input.custom-control-input(type='radio', v-model="repeatsOn", value="dayOfWeek")
              span.custom-control-indicator
              span.custom-control-description {{ $t('dayOfWeek') }}

        .tags-select.option(v-if="isUserTask")
          .tags-inline
            label(v-once) {{ $t('tags') }}
            .category-wrap(@click="showTagsSelect = !showTagsSelect", v-bind:class="{ active: showTagsSelect }")
              span.category-select(v-if='task.tags && task.tags.length === 0')
                .tags-none {{$t('none')}}
                .dropdown-toggle
              span.category-select(v-else)
                .category-label(v-for='tagName in truncatedSelectedTags', :title="tagName") {{ tagName }}
                .tags-more(v-if='remainingSelectedTags.length > 0') +{{ $t('more', { count: remainingSelectedTags.length }) }}
                .dropdown-toggle
          tags-popup(v-if="showTagsSelect", :tags="user.tags", v-model="task.tags", @close='closeTagsPopup()')

        .option(v-if="task.type === 'habit'")
          label(v-once) {{ $t('resetStreak') }}
          b-dropdown.streak-dropdown(:text="$t(task.frequency)")
            b-dropdown-item(v-for="frequency in ['daily', 'weekly', 'monthly']", :key="frequency", @click="task.frequency = frequency", :class="{active: task.frequency === frequency}")
              | {{ $t(frequency) }}

        .option(v-if="task.type === 'daily' && isUserTask && purpose === 'edit'")
          .form-group
            label(v-once) {{ $t('restoreStreak') }}
            input(type="number", v-model="task.streak", min="0", required)

        .option.group-options(v-if='groupId')
          label(v-once) Assigned To
          .category-wrap(@click="showAssignedSelect = !showAssignedSelect")
            span.category-select(v-if='assignedMembers && assignedMembers.length === 0') {{$t('none')}}
            span.category-select(v-else)
              span(v-for='memberId in assignedMembers') {{memberNamesById[memberId]}}
          .category-box(v-if="showAssignedSelect")
            .container
              .row
                .form-check.col-6(
                  v-for="member in members",
                  :key="member._id",
                )
                  label.custom-control.custom-checkbox
                    input.custom-control-input(type="checkbox", :value="member._id", v-model="assignedMembers", @change='toggleAssignment(member._id)')
                    span.custom-control-indicator
                    span.custom-control-description(v-once) {{ member.profile.name }}

              .row
                button.btn.btn-primary(@click="showAssignedSelect = !showAssignedSelect") {{$t('close')}}

        .option.group-options(v-if='groupId')
          label(v-once) Needs Approval
          toggle-switch(:label='""',
            :checked="requiresApproval",
            @change="updateRequiresApproval")

      .task-modal-footer(slot="modal-footer")
        span.cancel-task-btn(v-once, v-if="purpose === 'create'", @click="cancel()") {{ $t('cancel') }}
        span.delete-task-btn(v-once, v-if='canDelete', @click="destroy()") {{ $t('delete') }}
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  #task-modal {
    .modal-dialog.modal-sm {
      max-width: 448px;
    }

    label {
      font-weight: bold;
    }

    input, textarea {
      border: none;
      background-color: rgba(0, 0, 0, 0.16);
      opacity: 0.64;
      color: $white !important;

      &:focus {
        color: $white !important;
        opacity: 1;
      }
    }

    .modal-content {
      border-radius: 8px;
      border: none;
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }

    .task-modal-content, .task-modal-header {
      padding-left: 23px;
      padding-right: 23px;
    }

    .task-modal-header {
      color: $white;
      width: 100%;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      padding-top: 16px;
      padding-bottom: 24px;

      h1 {
        color: $white;
      }
    }

    .task-modal-content {
      padding-top: 24px;

      input {
        background: $white;
        border: 1px solid $gray-500;
        color: $gray-200 !important;

        &:focus {
          color: $gray-50 !important;
        }
      }
    }

    .info-icon {
      float: left;
      height: 16px;
      width: 16px;
      margin-left: 8px;
      margin-top: 2px;
    }

    .difficulty-trivial-icon {
      width: 16px;
      height: 16px;
      color: #A5A1AC;
    }

    .difficulty-normal-icon {
      width: 36px;
      height: 16px;
      color: #A5A1AC;
    }

    .difficulty-medium-icon {
      width: 36px;
      height: 32px;
      color: #A5A1AC;
    }

    .difficulty-hard-icon {
      width: 36px;
      height: 36px;
      color: #A5A1AC;
    }

    .option {
      margin-bottom: 12px;
      margin-top: 12px;
      position: relative;
    }

    .option-item {
      margin-right: 48px;
      cursor: pointer;

      &:last-child {
        margin-right: 0px;
      }

      &-selected {
        .svg-icon, .option-item-label {
          color: inherit !important;
        }
      }

      &-box {
        width: 64px;
        height: 64px;
        border-radius: 2px;
        background: $gray-600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .habit-control.task-habit-disabled-control-habit {
          color: $white !important;
          border: none;
          background: $gray-300;
        }
      }

      &-label {
        color: $gray-50;
        text-align: center;
      }
    }

    .category-wrap {
      cursor: pointer;
      margin-top: 0px;
    }

    .category-box {
      bottom: 0px;
      left: 40px;
      top: auto;
      z-index: 11;

      .container {
        max-height: 90vh;
        overflow: auto;
      }
    }

    .tags-select {
      position: relative;

      .tags-inline {
        align-items: center;
        display: flex;
        justify-content: flex-start;

        label {
          margin: 0;
        }

        .category-wrap {
          cursor: inherit;
          position: relative;
          border: 1px solid transparent;
          border-radius: 2px;
          margin-left: 4em;

          &.active {
            border-color: $purple-500;

            .category-select {
              box-shadow: none;
            }
          }

          .category-select {
            align-items: center;
            display: flex;
            padding: .6em;
            padding-right: 2.8em;
            width: 100%;

            .tags-none {
              margin: .26em 0 .26em .6em;

              & + .dropdown-toggle {
                right: 1.3em;
              }
            }

            .tags-more {
              color: #a5a1ac;
              flex: 0 1 auto;
              font-size: 12px;
              text-align: left;
              position: relative;
              left: .5em;
              width: 100%;
            }

            .dropdown-toggle {
              position: absolute;
              right: 1em;
              top: .8em;
            }

            .category-label {
              min-width: 68px;
              overflow: hidden;
              padding: .5em 1em;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 68px;
              word-wrap: break-word;
            }
          }
        }
      }

      .tags-popup {
        position: absolute;
        top: 3.5em;
        left: 6.2em;
      }
    }

    .streak-dropdown {
      margin-left: .5em;
    }

    .checklist-group {
      border-top: 1px solid $gray-500;
    }

    // From: https://codepen.io/zachariab/pen/wkrbc
    span.grippy {
      content: '....';
      width: 20px;
      height: 20px;
      display: inline-block;
      overflow: hidden;
      line-height: 5px;
      padding: 3px 4px;
      cursor: move;
      vertical-align: middle;
      margin-top: .5em;
      margin-right: .3em;
      font-size: 12px;
      font-family: sans-serif;
      letter-spacing: 2px;
      color: #cccccc;
      text-shadow: 1px 0 1px black;
    }

    span.grippy::after {
      content: '.. .. .. ..';
    }

    .checklist-item {
      margin-bottom: 0px;
      border-radius: 0px;
      border: none !important;
      padding-left: 36px;

      &:last-child {
        background-repeat: no-repeat;
        background-position: center left 10px;
        border-top: 1px solid $gray-500 !important;
        border-bottom: 1px solid $gray-500 !important;
        background-size: 10px 10px;
        background-image: url(~client/assets/svg/for-css/positive.svg);
      }

      &:hover {
        cursor: move;
      }
    }

    .delete-task-btn, .cancel-task-btn {
      cursor: pointer;

      &:hover, &:focus, &:active {
        text-decoration: underline;
      }
    }

    .task-modal-footer {
      margin: 0 auto;
      padding-bottom: 24px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      margin-top: 50px;



      .delete-task-btn {
        color: $red-50;
      }

      .cancel-task-btn {
        color: $blue-10;
      }
    }

    .weekday-check {
      margin-left: 0px;
      width: 57px;
    }
  }
</style>

<style lang="scss" scoped>
  .gold {
    width: 24px;
    margin-left: 5em;
    margin-top: -2.4em;
  }
</style>

<script>
import TagsPopup from './tagsPopup';
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapGetters, mapActions, mapState } from 'client/libs/store';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import toggleSwitch from 'client/components/ui/toggleSwitch';
import sortable from 'client/directives/sortable.directive';
import clone from 'lodash/clone';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import uuid from 'uuid';

import informationIcon from 'assets/svg/information.svg';
import difficultyTrivialIcon from 'assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from 'assets/svg/difficulty-medium.svg';
import difficultyHardIcon from 'assets/svg/difficulty-hard.svg';
import difficultyNormalIcon from 'assets/svg/difficulty-normal.svg';
import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import deleteIcon from 'assets/svg/delete.svg';
import goldIcon from 'assets/svg/gold.svg';

export default {
  components: {
    TagsPopup,
    bModal,
    bDropdown,
    bDropdownItem,
    Datepicker,
    toggleSwitch,
  },
  directives: {
    sortable,
  },
  // purpose is either create or edit, task is the task created or edited
  props: ['task', 'purpose', 'challengeId', 'groupId'],
  data () {
    return {
      maxTags: 3,
      showTagsSelect: false,
      showAssignedSelect: false,
      newChecklistItem: null,
      icons: Object.freeze({
        information: informationIcon,
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
        negative: negativeIcon,
        positive: positiveIcon,
        destroy: deleteIcon,
        gold: goldIcon,
      }),
      requiresApproval: false, // We can't set task.group fields so we use this field to toggle
      members: [],
      memberNamesById: {},
      assignedMembers: [],
      checklist: [],
    };
  },
  watch: {
    async task () {
      if (this.groupId && this.task.group && this.task.group.approval && this.task.group.approval.required) {
        this.requiresApproval = true;
      }

      if (this.groupId) {
        let members = await this.$store.dispatch('members:getGroupMembers', {
          groupId: this.groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
        this.members.forEach(member => {
          this.memberNamesById[member._id] = member.profile.name;
        });
        this.assignedMembers = [];
        if (this.task.group && this.task.group.assignedUsers) this.assignedMembers = this.task.group.assignedUsers;
      }

      // @TODO: This whole component is mutating a prop and that causes issues. We need to not copy the prop similar to group modals
      if (this.task) this.checklist = clone(this.task.checklist);
    },
  },
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
      getTagsFor: 'tasks:getTagsFor',
      canDeleteTask: 'tasks:canDelete',
    }),
    ...mapState({
      user: 'user.data',
      dayMapping: 'constants.DAY_MAPPING',
    }),
    checklistEnabled () {
      return ['daily', 'todo'].indexOf(this.task.type) > -1 && !this.isOriginalChallengeTask;
    },
    isOriginalChallengeTask () {
      let isUserChallenge = Boolean(this.task.userId);
      return !isUserChallenge && (this.challengeId || this.task.challenge && this.task.challenge.id);
    },
    canDelete () {
      return this.purpose !== 'create' && this.canDeleteTask(this.task);
    },
    title () {
      const type = this.$t(this.task.type);
      return this.$t(this.purpose === 'edit' ? 'editATask' : 'createTask', {type});
    },
    cssClass () {
      return this.getTaskClasses(this.task, this.purpose === 'edit' ? 'editModal' : 'createModal');
    },
    controlClass () {
      return this.getTaskClasses(this.task, this.purpose === 'edit' ? 'control' : 'controlCreate');
    },
    isUserTask () {
      return !this.challengeId && !this.groupId;
    },
    repeatSuffix () {
      const task = this.task;

      if (task.frequency === 'daily') {
        return task.everyX === 1 ? this.$t('day') : this.$t('days');
      } else if (task.frequency === 'weekly') {
        return task.everyX === 1 ? this.$t('week') : this.$t('weeks');
      } else if (task.frequency === 'monthly') {
        return task.everyX === 1 ? this.$t('month') : this.$t('months');
      } else if (task.frequency === 'yearly') {
        return task.everyX === 1 ? this.$t('year') : this.$t('years');
      }
    },
    repeatsOn: {
      get () {
        let repeatsOn = 'dayOfMonth';

        if (this.task.type === 'daily' && this.task.weeksOfMonth && this.task.weeksOfMonth.length > 0) {
          repeatsOn = 'dayOfWeek';
        }

        return repeatsOn;
      },
      set (newValue) {
        const task = this.task;

        if (task.frequency === 'monthly' && newValue === 'dayOfMonth') {
          const date = moment(task.startDate).date();
          task.weeksOfMonth = [];
          task.daysOfMonth = [date];
        } else if (task.frequency === 'monthly' && newValue === 'dayOfWeek') {
          const week = Math.ceil(moment(task.startDate).date() / 7) - 1;
          const dayOfWeek = moment(task.startDate).day();
          const shortDay = this.dayMapping[dayOfWeek];
          task.daysOfMonth = [];
          task.weeksOfMonth = [week];
          for (let key in task.repeat) {
            task.repeat[key] = false;
          }
          task.repeat[shortDay] = true;
        }
      },
    },
    selectedTags () {
      return this.getTagsFor(this.task);
    },
    truncatedSelectedTags () {
      return this.selectedTags.slice(0, this.maxTags);
    },
    remainingSelectedTags () {
      return this.selectedTags.slice(this.maxTags);
    },
  },
  methods: {
    ...mapActions({saveTask: 'tasks:save', destroyTask: 'tasks:destroy', createTask: 'tasks:create'}),
    closeTagsPopup () {
      this.showTagsSelect = false;
    },
    sortedChecklist (data) {
      let sorting = clone(this.task.checklist);
      let movingItem = sorting[data.oldIndex];
      sorting.splice(data.oldIndex, 1);
      sorting.splice(data.newIndex, 0, movingItem);
      this.task.checklist = sorting;
    },
    optionClass (activeCondition) {
      if (activeCondition) {
        return [`${this.cssClass}-color`, 'option-item-selected'];
      } else {
        return [];
      }
    },
    addChecklistItem (e) {
      let checkListItem = {
        id: uuid.v4(),
        text: this.newChecklistItem,
        completed: false,
      };
      this.task.checklist.push(checkListItem);
      // @TODO: managing checklist separately to help with sorting on the UI
      this.checklist.push(checkListItem);
      this.newChecklistItem = null;
      if (e) e.preventDefault();
    },
    removeChecklistItem (i) {
      this.task.checklist.splice(i, 1);
      this.checklist = clone(this.task.checklist);
    },
    weekdaysMin (dayNumber) {
      return moment.weekdaysMin(dayNumber);
    },
    async submit () {
      if (this.newChecklistItem) this.addChecklistItem();

      if (this.purpose === 'create') {
        if (this.challengeId) {
          this.$store.dispatch('tasks:createChallengeTasks', {
            challengeId: this.challengeId,
            tasks: [this.task],
          });
          this.$emit('taskCreated', this.task);
        } else if (this.groupId) {
          await this.$store.dispatch('tasks:createGroupTasks', {
            groupId: this.groupId,
            tasks: [this.task],
          });

          let promises = this.assignedMembers.map(memberId => {
            return this.$store.dispatch('tasks:assignTask', {
              taskId: this.task._id,
              userId: memberId,
            });
          });
          Promise.all(promises);

          this.task.group.assignedUsers = this.assignedMembers;

          this.$emit('taskCreated', this.task);
        } else {
          this.createTask(this.task);
        }
      } else {
        if (this.groupId) {
          this.task.group.assignedUsers = this.assignedMembers;
          this.task.requiresApproval = this.requiresApproval;
        }

        this.saveTask(this.task);
        this.$emit('taskEdited', this.task);
      }
      this.$root.$emit('hide::modal', 'task-modal');
    },
    destroy () {
      if (!confirm(this.$t('sureDelete'))) return;
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
      this.$root.$emit('hide::modal', 'task-modal');
    },
    cancel () {
      this.$root.$emit('hide::modal', 'task-modal');
    },
    onClose () {
      this.showTagsSelect = false;
      this.newChecklistItem = '';
      this.$emit('cancel');
    },
    updateRequiresApproval (newValue) {
      let truthy = true;
      if (!newValue) truthy = false; // This return undefined instad of false
      this.requiresApproval = truthy;
    },
    async toggleAssignment (memberId) {
      let assignedIndex = this.assignedMembers.indexOf(memberId);

      if (assignedIndex  === -1) {
        if (this.purpose === 'create') {
          return;
        }

        await this.$store.dispatch('tasks:unassignTask', {
          taskId: this.task._id,
          userId: memberId,
        });
        return;
      }

      if (this.purpose === 'create') {
        return;
      }

      await this.$store.dispatch('tasks:assignTask', {
        taskId: this.task._id,
        userId: memberId,
      });
    },
  },
};
</script>
