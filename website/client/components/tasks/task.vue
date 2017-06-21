<template lang="pug">
.task.d-flex
  // Habits left side control
  .left-control.d-flex.align-items-center(v-if="task.type === 'habit'", :class="controlClass.up")
    .habit-control(:class="controlClass.up + '-control'")
      .svg-icon.positive(v-html="icons.positive")
  // Dailies and todos left side control
  .left-control.d-flex.align-items-center(v-if="task.type === 'daily' || task.type === 'todo'", :class="controlClass")
  // Task title, description and icons
  .task-content
    h3.task-title(:class="{ 'has-notes': task.notes }") {{task.text}}
    .task-notes.small-text {{task.notes}}
    .icons.small-text icons
  // Habits right side control
  .right-control.d-flex.align-items-center(v-if="task.type === 'habit'", :class="controlClass.down")
    .habit-control(:class="controlClass.down + '-control'")
      .svg-icon.negative(v-html="icons.negative")
  // Rewards right side control
  .right-control.d-flex.align-items-center(v-if="task.type === 'reward'", :class="controlClass")
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.task {
  margin-bottom: 8px;
  box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
  background: $white;
  border-radius: 2px;
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
  float: right;
  color: $gray-300;
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

.habit-control {
  width: 28px;
  height: 28px;
  border-radius: 100px;
  color: $white;
  margin: 0 auto;

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
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';
import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';

export default {
  props: ['task'],
  data () {
    return {
      icons: Object.freeze({
        positive: positiveIcon,
        negative: negativeIcon,
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
  },
};
</script>