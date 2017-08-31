<template lang="pug">
div
  broken-task-modal(:brokenChallengeTask='brokenChallengeTask')
  .task(@click='castEnd($event, task)')
    approval-header(:task='task', v-if='this.task.group.id', :group='group')
    .d-flex(:class="{'task-not-scoreable': isUser !== true}")
      // Habits left side control
      .left-control.d-flex.align-items-center.justify-content-center(v-if="task.type === 'habit'", :class="controlClass.up")
        .task-control.habit-control(:class="controlClass.up + '-control-habit'", @click="(isUser && controlClass.up !== 'task-habit-disabled') ? score('up') : null")
          .svg-icon.positive(v-html="icons.positive")
      // Dailies and todos left side control
      .left-control.d-flex.justify-content-center(v-if="task.type === 'daily' || task.type === 'todo'", :class="controlClass")
        .task-control.daily-todo-control(:class="controlClass + '-control-daily-todo'", @click="isUser ? score(task.completed ? 'down' : 'up') : null")
          .svg-icon.check(v-html="icons.check", :class="{'display-check-icon': task.completed}")
      // Task title, description and icons
      .task-content(:class="contentClass")
        .task-clickable-area(@click="edit($event, task)")
          h3.task-title(:class="{ 'has-notes': task.notes }", v-markdown="task.text")
          .task-notes.small-text(v-markdown="task.notes")
        .checklist(v-if="task.checklist && task.checklist.length > 0")
          label.custom-control.custom-checkbox.checklist-item(
            v-for="item in task.checklist", :class="{'checklist-item-done': item.completed}",
          )
            input.custom-control-input(type="checkbox", :checked="item.completed", @change="toggleChecklistItem(item)")
            span.custom-control-indicator
            span.custom-control-description(v-markdown='item.text')
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
              .svg-icon.challenge.broken(v-html="icons.challenge", v-if='task.challenge.broken', @click='handleBrokenTask(task)')
            b-popover.tags-popover.no-span-margin(
              :triggers="['hover']",
              :placement="'bottom'",
              :popover-style="{'max-width': '1000px'}",
            )
              .d-flex.align-items-center(slot="content")
                .tags-popover-title(v-once) {{ `${$t('tags')}:` }}
                .tag-label(v-for="tag in getTagsFor(task)") {{tag}}
              .d-flex.align-items-center(v-if="task.tags && task.tags.length > 0")
                .svg-icon.tags(v-html="icons.tags")

      // Habits right side control
      .right-control.d-flex.align-items-center.justify-content-center(v-if="task.type === 'habit'", :class="controlClass.down")
        .task-control.habit-control(:class="controlClass.down + '-control-habit'", @click="(isUser && controlClass.down !== 'task-habit-disabled') ? score('down') : null")
          .svg-icon.negative(v-html="icons.negative")
      // Rewards right side control
      .right-control.d-flex.align-items-center.justify-content-center.reward-control(v-if="task.type === 'reward'", :class="controlClass", @click="isUser ? score('down') : null")
        .svg-icon(v-html="icons.gold")
        .small-text {{task.value}}
    approval-footer(:task='task', v-if='this.task.group.id', :group='group')
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  .task {
    margin-bottom: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    background: transparent;
    border-radius: 2px;
    z-index: 9;
    position: relative;

    &:hover {
      box-shadow: 0 1px 8px 0 rgba($black, 0.12), 0 4px 4px 0 rgba($black, 0.16);

      .left-control, .right-control, .task-content {
        border-color: $purple-500;
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

    &.has-notes {
      padding-bottom: 0px;
    }
  }

  .task-notes {
    color: $gray-100;
    font-style: normal;
  }

  .task-content {
    padding: 8px;
    flex-grow: 1;
    cursor: pointer;
    background: $white;
    border: 1px solid transparent;

    &.no-right-border {
      border-right: none !important;
    }
  }

  .checklist {
    margin-bottom: 2px;
    margin-top: 8px;
  }

  .checklist-item {
    color: $gray-50;
    font-size: 14px;
    line-height: 1.43;
    margin-bottom: 10px;
    min-height: 0px;
    width: 100%;

    &-done {
      color: $gray-300;
      text-decoration: line-through;
    }

    .custom-control-indicator {
      margin-top: -2px;
    }

    .custom-control-description {
      margin-left: 6px;
      padding-top: 0px;
    }
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

  .no-span-margin span {
    margin-left: 0px !important;
  }

  .svg-icon.streak {
    width: 11.6px;
    height: 7.1px;
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

  .left-control {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    min-height: 60px;
    border: 1px solid transparent;
    border-right: none;

    & + .task-content {
      border-left: none;
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
      color: $yellow-10;
      font-style: initial;
    }
  }
</style>

<style lang="scss">
  // not working as scoped css
  @import '~client/assets/scss/colors.scss';

  .tags-popover {
    // TODO fix padding, see https://github.com/bootstrap-vue/bootstrap-vue/issues/559#issuecomment-311150335
    white-space: nowrap;
  }

  .tags-popover-title {
    margin-right: 4px;
    display: block;
    float: left;
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
  }
</style>

<script>
import { mapState, mapGetters, mapActions } from 'client/libs/store';
import moment from 'moment';
import axios from 'axios';
import scoreTask from 'common/script/ops/scoreTask';
import Vue from 'vue';

import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import goldIcon from 'assets/svg/gold.svg';
import streakIcon from 'assets/svg/streak.svg';
import calendarIcon from 'assets/svg/calendar.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import tagsIcon from 'assets/svg/tags.svg';
import checkIcon from 'assets/svg/check.svg';
import bPopover from 'bootstrap-vue/lib/components/popover';
import markdownDirective from 'client/directives/markdown';
import notifications from 'client/mixins/notifications';
import brokenTaskModal from './brokenTaskModal';
import approvalHeader from './approvalHeader';
import approvalFooter from './approvalFooter';

export default {
  mixins: [notifications],
  components: {
    bPopover,
    approvalFooter,
    approvalHeader,
    brokenTaskModal,
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
        tags: tagsIcon,
        check: checkIcon,
      }),
      brokenChallengeTask: {},
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    ...mapGetters({
      getTagsFor: 'tasks:getTagsFor',
      getTaskClasses: 'tasks:getTaskClasses',
    }),
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
      const dueDate = this.dueDate || new Date();
      return this.getTaskClasses(this.task, 'control', dueDate);
    },
    contentClass () {
      const classes = [];
      const dueDate = this.dueDate || new Date();
      classes.push(this.getTaskClasses(this.task, 'content'), dueDate);
      if (this.task.type === 'reward' || this.task.type === 'habit') {
        classes.push('no-right-border');
      }
      return classes;
    },
    showStreak () {
      if (this.task.streak !== undefined) return true;
      if (this.task.type === 'habit' && (this.task.up || this.task.down)) return true;
      return false;
    },
    isDueOverdue () {
      return moment().diff(this.task.date, 'days') >= 0;
    },
    dueIn () {
      const dueIn = moment().to(this.task.date);
      return this.$t('dueIn', {dueIn});
    },
  },
  methods: {
    ...mapActions({scoreChecklistItem: 'tasks:scoreChecklistItem'}),
    toggleChecklistItem (item) {
      item.completed = !item.completed;
      this.scoreChecklistItem({taskId: this.task._id, itemId: item.id});
    },
    edit (e, task) {
      // Prevent clicking on a link from opening the edit modal
      const target = e.target || e.srcElement;

      if (target.tagName === 'A') { // Link
        return;
      } else if (!this.$store.state.spellOptions.castingSpell) {
        this.$emit('editTask', task);
      }
    },
    castEnd (e, task) {
      this.$root.$emit('castEnd', task, 'task', e);
    },
    async score (direction) {
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

      if (task.group.approval.required) task.group.approval.requested = true;

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
        let text;
        let type;
        // TODO $rootScope.playSound('Item_Drop');

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
          text = Content.hatchingPotions[drop.key].text();
          this.drop(this.$t('messageDropPotion', {dropText: text}), drop);
        } else if (drop.type === 'Egg') {
          text = Content.eggs[drop.key].text();
          this.drop(this.$t('messageDropEgg', {dropText: text}), drop);
        } else if (drop.type === 'Food') {
          text = Content.food[drop.key].text();
          this.drop(this.$t('messageDropFood', {dropArticle: drop.article, dropText: text}), drop);
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
      this.brokenChallengeTask = task;
      this.$root.$emit('show::modal', 'broken-task-modal');
    },
  },
};
</script>
