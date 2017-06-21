<template lang="pug">
.task.d-flex
  .left-control.d-flex.align-items-center(v-if="leftControl", :class="controlColor")
    .control-area(:class="controlAreaColor")
  .task-content
    h3.task-title(:class="{ 'has-notes': task.notes }") {{task.text}}
    .task-notes.small-text {{task.notes}}
    .icons.small-text icons
  .right-control.d-flex.align-items-center(v-if="rightControl", :class="controlColor")
    .control-area(:class="controlAreaColor")
  // template(v-if="task.type === 'daily' || task.type === 'todo'")
    p completed: {{task.completed}}
    p
      span checklist
      ul 
        li(v-for="checklist in task.checklist") {{checklist.text}}
  // template(v-if="task.type === 'daily'") 
    p streak: {{task.streak}}
    p repeat: {{task.repeat}}
  // p(v-if="task.type === 'todo'") due date: {{task.date}}
  // p attribute {{task.attribute}}
  // p difficulty {{task.priority}}
  // p tags {{getTagsFor(task)}}
</template>

<style lang="scss" scoped>
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

.control-area {
  width: 28px;
  height: 28px;
  border-radius: 100px;
  color: $white;
  margin: 0 auto;
}
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';

export default {
  props: ['task'],
  computed: {
    ...mapState({user: 'user.data'}),
    ...mapGetters({
      getTagsFor: 'tasks:getTagsFor',
      getColorClassFor: 'tasks:getColorClassFor',
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
    controlColor () {
      return this.getColorClassFor(this.task);
    },
    controlAreaColor () {
      return this.getColorClassFor(this.task, {isControlArea: true});
    },
  },
  data () {
    return {
      colors: Object.freeze({

      }),
    };
  },
};
</script>