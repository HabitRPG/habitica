<template lang="pug">
.task.d-flex
  // Habits left side control
  .left-control.d-flex.align-items-center.justify-content-center(v-if="task.type === 'habit'", :class="controlClass.up")
    .task-control.habit-control(:class="controlClass.up + '-control-habit'")
      .svg-icon.positive(v-html="icons.positive")
  // Dailies and todos left side control
  .left-control.d-flex.justify-content-center(v-if="task.type === 'daily' || task.type === 'todo'", :class="controlClass")
    .task-control.daily-todo-control(:class="controlClass + '-control-daily-todo'")
      .svg-icon.check(v-html="icons.check", v-if="task.completed")
  // Task title, description and icons
  .task-content(:class="contentClass")
    h3.task-title(
      :class="{ 'has-notes': task.notes }", 
      v-html="$options.filters.markdown(task.text)"
    )
    .task-notes.small-text(v-html="$options.filters.markdown(task.notes)")
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
          .svg-icon.challenge(v-html="icons.challenge")
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
    .task-control.habit-control(:class="controlClass.down + '-control-habit'")
      .svg-icon.negative(v-html="icons.negative")
  // Rewards right side control
  .right-control.d-flex.align-items-center.justify-content-center.reward-control(v-if="task.type === 'reward'", :class="controlClass")
    .svg-icon(v-html="icons.gold")
    .small-text {{task.value}}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.task {
  margin-bottom: 8px;
  box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
  background: $white;
  border-radius: 2px;
  z-index: 9;
  position: relative;
}

.task-title {
  margin-bottom: 8px;
  color: $gray-10;
  font-weight: normal;

  &.has-notes {
    margin-bottom: 0px;
  }
}

.task-notes {
  color: $gray-100;
  font-style: normal;
  margin-bottom: 4px;
}

.task-content {
  padding: 8px;
  flex-grow: 1;
}

.icons {
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

.left-control, .right-control {
  width: 40px;
  flex-shrink: 0;
}

.left-control {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}

.right-control {
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.task-control {
  width: 28px;
  height: 28px;
}

.habit-control {
  border-radius: 100px;
  color: $white;

  .svg-icon {
    width: 10px;
    margin: 0 auto;
  }

  .positive {
    margin-top: 9px;
  }

  .negative {
    margin-top: 13px;
  }
}

.daily-todo-control {
  margin-top: 16px;
  border-radius: 2px;
}

.reward-control {
  flex-direction: column;
  padding-top: 16px;
  padding-bottom: 12px;

  .svg-icon {
    width: 24px;
    height: 24px;
  }

  .small-text {
    margin-top: 4px;
    color: $yellow-10;
  }
}
</style>

<style lang="scss"> // not working as scoped css
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
import { mapState, mapGetters } from 'client/libs/store';
import moment from 'moment';

import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import goldIcon from 'assets/svg/gold.svg';
import streakIcon from 'assets/svg/streak.svg';
import calendarIcon from 'assets/svg/calendar.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import tagsIcon from 'assets/svg/tags.svg';
import checkIcon from 'assets/svg/check.svg';
import bPopover from 'bootstrap-vue/lib/components/popover';

export default {
  components: {
    bPopover,
  },
  props: ['task'],
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
      return this.getTaskClasses(this.task, 'control');
    },
    contentClass () {
      return this.getTaskClasses(this.task, 'content');
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
};
</script>