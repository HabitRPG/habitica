<template lang="pug">
.task-wrapper
  .task(@click='castEnd($event, task)')
    approval-header(:task='task', v-if='this.task.group.id', :group='group')
    .d-flex(:class="{'task-not-scoreable': isUser !== true}")
      // Habits left side control
      .left-control.d-flex.align-items-center.justify-content-center(v-if="task.type === 'habit'", :class="controlClass.up.bg")
        .task-control.habit-control(:class="controlClass.up.inner", @click="(isUser && task.up) ? score('up') : null")
          .svg-icon.positive(v-html="icons.positive")
      // Dailies and todos left side control
      .left-control.d-flex.justify-content-center(v-if="task.type === 'daily' || task.type === 'todo'", :class="controlClass.bg")
        .task-control.daily-todo-control(:class="controlClass.inner", @click="isUser ? score(task.completed ? 'down' : 'up') : null")
          .svg-icon.check(v-html="icons.check", :class="{'display-check-icon': task.completed, [controlClass.checkbox]: true}")
      // Task title, description and icons
      .task-content(:class="contentClass")
        .task-clickable-area(@click="edit($event, task)", :class="{'task-clickable-area-user': isUser}")
          .d-flex.justify-content-between
            h3.task-title(:class="{ 'has-notes': task.notes }", v-markdown="task.text")
            menu-dropdown.task-dropdown(
              v-if="isUser && !isRunningYesterdailies",
              :right="task.type === 'reward'",
              ref="taskDropdown"
            )
              div(slot="dropdown-toggle", draggable=false)
                .svg-icon.dropdown-icon(v-html="icons.menu")
              div(slot="dropdown-content", draggable=false)
                .dropdown-item.edit-task-item(ref="editTaskItem")
                  span.dropdown-icon-item
                    span.svg-icon.inline.edit-icon(v-html="icons.edit")
                    span.text {{ $t('edit') }}
                .dropdown-item(@click="moveToTop")
                  span.dropdown-icon-item
                    span.svg-icon.inline.push-to-top(v-html="icons.top")
                    span.text {{ $t('taskToTop') }}
                .dropdown-item(@click="moveToBottom")
                  span.dropdown-icon-item
                    span.svg-icon.inline.push-to-bottom(v-html="icons.bottom")
                    span.text {{ $t('taskToBottom') }}
                .dropdown-item(@click="destroy", v-if="canDelete(task)")
                  span.dropdown-icon-item.delete-task-item
                    span.svg-icon.inline.delete(v-html="icons.delete")
                    span.text {{ $t('delete') }}

          .task-notes.small-text(
            v-markdown="task.notes",
            :class="{'has-checklist': task.notes && hasChecklist}",
          )
        .checklist(v-if="canViewchecklist")
          .d-inline-flex
            .collapse-checklist.d-flex.align-items-center.expand-toggle(
              v-if="isUser",
              @click="collapseChecklist(task)",
              :class="{open: !task.collapseChecklist}",
              v-b-tooltip.hover.bottom="$t(`${task.collapseChecklist ? 'expand': 'collapse'}Checklist`)",
            )
              .svg-icon(v-html="icons.checklist")
              span {{ checklistProgress }}
          .custom-control.custom-checkbox.checklist-item(
            v-if='!task.collapseChecklist',
            v-for="item in task.checklist", :class="{'checklist-item-done': item.completed}",
          )
            input.custom-control-input(
              type="checkbox",
              :checked="item.completed",
              @change="toggleChecklistItem(item)",
              :disabled="castingSpell",
              :id="`checklist-${item.id}`"
            )
            label.custom-control-label(v-markdown="item.text", :for="`checklist-${item.id}`")
        .icons.small-text.d-flex.align-items-center
          .d-flex.align-items-center(v-if="task.type === 'todo' && task.date", :class="{'due-overdue': isDueOverdue}")
            .svg-icon.calendar(v-html="icons.calendar")
            span {{dueIn}}
          .icons-right.d-flex.justify-content-end
            .d-flex.align-items-center(v-if="showStreak")
              .svg-icon.streak(v-html="icons.streak")
              span(v-if="task.type === 'daily'") {{task.streak}}
              span(v-if="task.type === 'habit'")
                span.m-0(v-if="task.up") +{{task.counterUp}}
                span.m-0(v-if="task.up && task.down") &nbsp;|&nbsp;
                span.m-0(v-if="task.down") -{{task.counterDown}}
            .d-flex.align-items-center(v-if="task.challenge && task.challenge.id")
              .svg-icon.challenge(v-html="icons.challenge", v-if='!task.challenge.broken')
              .svg-icon.challenge.broken(v-html="icons.brokenChallengeIcon", v-if='task.challenge.broken', @click='handleBrokenTask(task)')
            .d-flex.align-items-center(v-if="hasTags", :id="`tags-icon-${task._id}`")
              .svg-icon.tags(v-html="icons.tags")
            #tags-popover
            b-popover(
              v-if="hasTags",
              :target="`tags-icon-${task._id}`",
              triggers="hover",
              placement="bottom",
              container="tags-popover",
            )
              .d-flex.align-items-center.tags-container
                .tags-popover-title(v-once) {{ `${$t('tags')}:` }}
                .tag-label(v-for="tag in getTagsFor(task)") {{tag}}

      // Habits right side control
      .right-control.d-flex.align-items-center.justify-content-center(v-if="task.type === 'habit'", :class="controlClass.down.bg")
        .task-control.habit-control(:class="controlClass.down.inner", @click="(isUser && task.down) ? score('down') : null")
          .svg-icon.negative(v-html="icons.negative")
      // Rewards right side control
      .right-control.d-flex.align-items-center.justify-content-center.reward-control(v-if="task.type === 'reward'", :class="controlClass.bg", @click="isUser ? score('down') : null")
        .svg-icon(v-html="icons.gold")
        .small-text {{task.value}}
    approval-footer(:task='task', v-if='this.task.group.id', :group='group')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .task {
    margin-bottom: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    background: transparent;
    border-radius: 2px;
    position: relative;

    &:hover {
      box-shadow: 0 1px 8px 0 rgba($black, 0.12), 0 4px 4px 0 rgba($black, 0.16);

      .left-control, .right-control, .task-content {
        border-color: $purple-400;
      }
    }
  }

  .task-habit-disabled-control-habit:hover {
    cursor: initial;
  }

  .task-title {
    padding-bottom: 8px;
    color: $gray-10;
    font-weight: normal;
    margin-bottom: 0px;
    margin-right: 15px;
    line-height: 1.43;
    font-size: 14px;
    min-width: 0px;
    overflow-wrap: break-word;

    &.has-notes {
      padding-bottom: 4px;
    }
  }

  .task-clickable-area {
    padding: 7px 8px;
    padding-bottom: 0px;

    &-user {
      padding-right: 0px;
    }
  }

  .task-title + .task-dropdown /deep/ .dropdown-menu {
    margin-top: 2px !important;
  }

  .dropdown-icon {
    width: 4px;
    height: 16px;
    margin-right: 0px;
    color: $gray-100 !important;
  }

  .task /deep/ .habitica-menu-dropdown .habitica-menu-dropdown-toggle {
    opacity: 0;
    padding: 0 8px;
    transition: opacity 0.15s ease-in;
  }

  .task:hover /deep/ .habitica-menu-dropdown .habitica-menu-dropdown-toggle {
    opacity: 1;
  }

  .task-clickable-area /deep/ .habitica-menu-dropdown.open .habitica-menu-dropdown-toggle {
    opacity: 1;

    .svg-icon {
      color: $purple-400 !important;
    }
  }

  .task-clickable-area /deep/ .habitica-menu-dropdown .habitica-menu-dropdown-toggle:hover .svg-icon {
    color: $purple-400 !important;
  }

  .task-dropdown {
    max-height: 16px;
  }

  .task-dropdown /deep/ .dropdown-menu {
    .dropdown-item {
      cursor: pointer !important;
      transition: none;

      * {
        transition: none;
      }

      &:hover {
        color: $purple-300;

        .svg-icon.push-to-top, .svg-icon.push-to-bottom {
          * {
            stroke: $purple-300;
          }
        }
      }
    }
  }

  .task-notes {
    color: $gray-100;
    font-style: normal;
    padding-right: 20px;
    min-width: 0px;
    overflow-wrap: break-word;

    &.has-checklist {
      padding-bottom: 8px;
    }
  }

  .task-content {
    padding-top: 0px;
    padding-bottom: 7px;
    flex-grow: 1;
    cursor: pointer;
    background: $white;
    border: 1px solid transparent;
    transition-duration: 0.15;
    min-width: 0px;

    &.no-right-border {
      border-right: none !important;
    }

    &.reward-content {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }
  }

  .checklist {
    margin-bottom: 2px;
    margin-top: -3px;
  }

  .collapse-checklist {
    padding: 2px 6px;
    margin-bottom: 9px;
    border-radius: 1px;
    background-color: $gray-600;
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    color: $gray-200;

    span {
      margin: 0px 4px;
    }

    .svg-icon {
      width: 12px;
      height: 8px;
    }
  }

  .checklist-item {
    color: $gray-50;
    font-size: 14px;
    line-height: 1.43;
    margin-bottom: 10px;
    min-height: 0px;
    width: 100%;
    margin-left: 8px;
    padding-right: 20px;
    overflow-wrap: break-word;

    &-done {
      color: $gray-300;
      text-decoration: line-through;
    }

    .custom-control-label::before, .custom-control-label::after {
      margin-top: -2px;
    }

    .custom-control-label {
      margin-left: 6px;
      padding-top: 0px;
      min-width: 0px;
    }
  }

  .icons, .checklist {
    padding: 0 8px;
  }

  .icons {
    margin-top: 4px;
    color: $gray-300;
    font-style: normal;

    &-right {
      flex-grow: 1;
    }
  }

  .icons-right .svg-icon {
    margin-left: 8px;
  }

  .icons span {
    margin-left: 4px;
  }

  .svg-icon.streak {
    width: 11.6px;
    height: 7.1px;
  }

  .delete-task-item {
    color: $red-10;
  }

  .edit-task-item span.text {
    margin-left: -3px;
  }

  .svg-icon.edit-icon {
    width: 16px;
    height: 16px;
  }

  .svg-icon.push-to-top, .svg-icon.push-to-bottom {
    width: 10px;
    height: 11px;
    margin-left: 3px;

    svg {
      stroke: $purple-300;
    }
  }

  .svg-icon.delete {
    width: 14px;
    height: 16px;
  }

  .tags.svg-icon, .calendar.svg-icon {
    width: 14px;
    height: 14px;
  }

  .tags:hover {
    color: $purple-500;
  }

  .due-overdue {
    color: $red-50;
  }

  .calendar.svg-icon {
    margin-right: 2px;
    margin-top: -2px;
  }

  .challenge.svg-icon {
    width: 14px;
    height: 12px;
  }

  .check.svg-icon {
    width: 12.3px;
    height: 9.8px;
    margin: 9px 8px;
  }

  .challenge.broken {
    color: $red-50;
  }

  .left-control, .right-control {
    width: 40px;
    flex-shrink: 0;
  }

  .left-control, .right-control, .task-control {
    transition-duration: 0.15s;
    transition-property: border-color, background, color;
    transition-timing-function: ease-in;
  }

  .left-control {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    min-height: 60px;
    border: 1px solid transparent;
    border-right: none;

    & + .task-content {
      border-left: none;
      border-top-right-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }

  .right-control {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    min-height: 56px;
    border: 1px solid transparent;
    border-left: none;
  }

  .task-control, .reward-control {
    cursor: pointer;
  }

  .task-not-scoreable {
    .task-control, .reward-control {
      cursor: default !important;
    }

    .svg-icon.check {
      display: none !important;
    }
  }

  .daily-todo-control {
    margin-top: 16px;
    border-radius: 2px;
    margin-left: -1px;
  }

  .reward-control {
    flex-direction: column;
    padding-top: 8px;
    padding-bottom: 4px;

    .svg-icon {
      width: 24px;
      height: 24px;
    }

    .small-text {
      margin-top: 4px;
      font-style: initial;
      font-weight: bold;
    }
  }

  #tags-popover /deep/ {
    .tags-container {
      flex-wrap: wrap;
      margin-top: -3px;
      margin-bottom: -3px;
    }

    .tags-popover-title {
      margin-right: 4px;
      display: block;
      float: left;
      margin-top: -3px;
      margin-bottom: -3px;
    }

    .tag-label {
      display: block;
      float: left;
      margin-left: 4px;
      border-radius: 100px;
      background-color: $gray-50;
      padding: 4px 10px;
      color: $gray-300;
      white-space: nowrap;
      margin-top: 3px;
      margin-bottom: 3px;
    }
  }
</style>


<script>
import { mapState, mapGetters, mapActions } from 'client/libs/store';
import moment from 'moment';
import axios from 'axios';
import scoreTask from 'common/script/ops/scoreTask';
import Vue from 'vue';
import * as Analytics from 'client/libs/analytics';

import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import goldIcon from 'assets/svg/gold.svg';
import streakIcon from 'assets/svg/streak.svg';
import calendarIcon from 'assets/svg/calendar.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import brokenChallengeIcon from 'assets/svg/broken-megaphone.svg';
import tagsIcon from 'assets/svg/tags.svg';
import checkIcon from 'assets/svg/check.svg';
import editIcon from 'assets/svg/edit.svg';
import topIcon from 'assets/svg/top.svg';
import bottomIcon from 'assets/svg/bottom.svg';
import deleteIcon from 'assets/svg/delete.svg';
import checklistIcon from 'assets/svg/checklist.svg';
import menuIcon from 'assets/svg/menu.svg';
import markdownDirective from 'client/directives/markdown';
import notifications from 'client/mixins/notifications';
import approvalHeader from './approvalHeader';
import approvalFooter from './approvalFooter';
import MenuDropdown from '../ui/customMenuDropdown';

export default {
  mixins: [notifications],
  components: {
    approvalFooter,
    approvalHeader,
    MenuDropdown,
  },
  directives: {
    markdown: markdownDirective,
  },
  props: ['task', 'isUser', 'group', 'dueDate'], // @TODO: maybe we should store the group on state?
  data () {
    return {
      icons: Object.freeze({
        positive: positiveIcon,
        negative: negativeIcon,
        gold: goldIcon,
        streak: streakIcon,
        calendar: calendarIcon,
        challenge: challengeIcon,
        brokenChallengeIcon,
        tags: tagsIcon,
        check: checkIcon,
        checklist: checklistIcon,
        delete: deleteIcon,
        edit: editIcon,
        top: topIcon,
        bottom: bottomIcon,
        menu: menuIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      castingSpell: 'spellOptions.castingSpell',
      isRunningYesterdailies: 'isRunningYesterdailies',
    }),
    ...mapGetters({
      getTagsFor: 'tasks:getTagsFor',
      getTaskClasses: 'tasks:getTaskClasses',
      canDelete: 'tasks:canDelete',
    }),
    hasChecklist () {
      return this.task.checklist && this.task.checklist.length > 0;
    },
    canViewchecklist () {
      let userIsTaskUser = this.task.userId ? this.task.userId === this.user._id : true;
      return this.hasChecklist && userIsTaskUser;
    },
    checklistProgress () {
      const totalItems = this.task.checklist.length;
      const completedItems = this.task.checklist.reduce((total, item) => {
        return item.completed ? total + 1 : total;
      }, 0);
      return `${completedItems}/${totalItems}`;
    },
    leftControl () {
      const task = this.task;
      if (task.type === 'reward') return false;
      return true;
    },
    rightControl () {
      const task = this.task;
      if (task.type === 'reward') return true;
      if (task.type === 'habit') return true;
      return false;
    },
    controlClass () {
      return this.getTaskClasses(this.task, 'control', this.dueDate);
    },
    contentClass () {
      const type = this.task.type;

      const classes = [];
      classes.push(this.getTaskClasses(this.task, 'control', this.dueDate).content);

      if (type === 'reward' || type === 'habit') {
        classes.push('no-right-border');
      }

      if (type === 'reward') {
        classes.push('reward-content');
      }

      return classes;
    },
    showStreak () {
      if (this.task.streak !== undefined) return true;
      if (this.task.type === 'habit' && (this.task.up || this.task.down)) return true;
      return false;
    },
    timeTillDue () {
      // this.task && is necessary to make sure the computed property updates correctly
      const endOfToday = moment().endOf('day');
      const endOfDueDate = moment(this.task && this.task.date).endOf('day');

      return moment.duration(endOfDueDate.diff(endOfToday));
    },
    isDueOverdue () {
      return this.timeTillDue.asDays() <= 0;
    },
    dueIn () {
      const dueIn = this.timeTillDue.asDays() === 0 ?
        this.$t('today') :
        this.timeTillDue.humanize(true);

      return this.$t('dueIn', { dueIn });
    },
    hasTags () {
      return this.task.tags && this.task.tags.length > 0;
    },
  },
  methods: {
    ...mapActions({
      scoreChecklistItem: 'tasks:scoreChecklistItem',
      collapseChecklist: 'tasks:collapseChecklist',
      destroyTask: 'tasks:destroy',
    }),
    toggleChecklistItem (item) {
      if (this.castingSpell) return;
      item.completed = !item.completed; // @TODO this should go into the action?
      this.scoreChecklistItem({taskId: this.task._id, itemId: item.id});
    },
    edit (e, task) {
      if (this.isRunningYesterdailies) return;

      // Prevent clicking on a link from opening the edit modal
      const target = e.target || e.srcElement;

      if (target.tagName === 'A') return; // clicked on a link

      const isDropdown = this.$refs.taskDropdown && this.$refs.taskDropdown.$el.contains(target);
      const isEditAction = this.$refs.editTaskItem && this.$refs.editTaskItem.contains(target);

      if (isDropdown && !isEditAction) return;

      if (!this.$store.state.spellOptions.castingSpell) {
        this.$emit('editTask', task);
      }
    },
    moveToTop () {
      this.$emit('moveTo', this.task, 'top');
    },
    moveToBottom () {
      this.$emit('moveTo', this.task, 'bottom');
    },
    destroy () {
      if (!confirm(this.$t('sureDelete'))) return;
      this.destroyTask(this.task);
      this.$emit('taskDestroyed', this.task);
    },
    castEnd (e, task) {
      this.$root.$emit('castEnd', task, 'task', e);
    },
    async score (direction) {
      if (this.castingSpell) return;

      // TODO move to an action
      const Content = this.$store.state.content;
      const user = this.user;
      const task = this.task;

      try {
        scoreTask({task, user, direction});
      } catch (err) {
        this.text(err.message);
        return;
      }

      switch (this.task.type) {
        case 'habit':
          this.$root.$emit('playSound', direction === 'up' ? 'Plus_Habit' : 'Minus_Habit');
          break;
        case 'todo':
          this.$root.$emit('playSound', 'Todo');
          break;
        case 'daily':
          this.$root.$emit('playSound', 'Daily');
          break;
        case 'reward':
          this.$root.$emit('playSound', 'Reward');
          break;
      }


      if (task.group.approval.required) task.group.approval.requested = true;

      Analytics.updateUser();
      const response = await axios.post(`/api/v3/tasks/${task._id}/score/${direction}`);
      const tmp = response.data.data._tmp || {}; // used to notify drops, critical hits and other bonuses
      const crit = tmp.crit;
      const drop = tmp.drop;
      const quest = tmp.quest;

      if (crit) {
        const critBonus = crit * 100 - 100;
        this.crit(critBonus);
      }

      if (quest && user.party.quest && user.party.quest.key) {
        const userQuest = Content.quests[user.party.quest.key];
        if (quest.progressDelta && userQuest.boss) {
          this.quest('questDamage', quest.progressDelta.toFixed(1));
        } else if (quest.collection && userQuest.collect) {
          user.party.quest.progress.collectedItems++;
          this.quest('questCollection', quest.collection);
        }
      }

      if (drop) {
        let dropText;
        let dropNotes;
        let type;

        this.$root.$emit('playSound', 'Item_Drop');

        // Note: For Mystery Item gear, drop.type will be 'head', 'armor', etc
        // so we use drop.notificationType below.

        if (drop.type !== 'gear' && drop.type !== 'Quest' && drop.notificationType !== 'Mystery') {
          if (drop.type === 'Food') {
            type = 'food';
          } else if (drop.type === 'HatchingPotion') {
            type = 'hatchingPotions';
          } else {
            type = `${drop.type.toLowerCase()}s`;
          }

          if (!user.items[type][drop.key]) {
            Vue.set(user, `items.${type}.${drop.key}`, 0);
          }
          user.items[type][drop.key]++;
        }

        if (drop.type === 'HatchingPotion') {
          dropText = Content.hatchingPotions[drop.key].text();
          dropNotes = Content.hatchingPotions[drop.key].notes();
          this.drop(this.$t('messageDropPotion', {dropText, dropNotes}), drop);
        } else if (drop.type === 'Egg') {
          dropText = Content.eggs[drop.key].text();
          dropNotes = Content.eggs[drop.key].notes();
          this.drop(this.$t('messageDropEgg', {dropText, dropNotes}), drop);
        } else if (drop.type === 'Food') {
          dropText = Content.food[drop.key].text();
          dropNotes = Content.food[drop.key].notes();
          this.drop(this.$t('messageDropFood', {dropArticle: drop.article, dropText, dropNotes}), drop);
        } else if (drop.type === 'Quest') {
          // TODO $rootScope.selectedQuest = Content.quests[drop.key];
          // $rootScope.openModal('questDrop', {controller:'PartyCtrl', size:'sm'});
        } else {
          // Keep support for another type of drops that might be added
          this.drop(drop.dialog);
        }
      }
    },
    handleBrokenTask (task) {
      if (this.$store.state.isRunningYesterdailies) return;
      this.$root.$emit('handle-broken-task', task);
    },
  },
};
</script>
