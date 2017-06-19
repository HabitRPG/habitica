<template lang="pug">
.task(:class="color")
  h3.task-title {{task.text}}
  .task-notes.small-text {{task.notes}}
  // p(v-if="task.type === 'habit'") up: {{task.up}}, down: {{task.down}}
  // p value: {{task.value}}
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
  padding: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
  background: $white;
}

.task-title {
  margin-bottom: 0px;
  color: $gray-10;
  font-weight: normal;
}

.task-notes {
  color: $gray-100;
  font-style: normal;
}

.color {
  &-worst {
    background: $maroon-100;
  }

  &-worse {
    background: $red-100;
  }

  &-bad {
    background: $orange-100;
  }

  &-neutral {
    background: $yellow-50;
  }

  &-good {
    background: $green-10;
  }

  &-better {
    background: $blue-50;
  }

  &-best {
   background: $teal-50;
  }
}
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';

export default {
  props: ['task'],
  computed: {
    ...mapState({user: 'user.data'}),
    ...mapGetters({getTagsFor: 'tasks:getTagsFor'}),
    color () {
      const value = this.task.value;

      if (this.task.type === 'reward') {
        return 'color-purple';
      } else if (value < -20) {
        return 'color-worst';
      } else if (value < -10) {
        return 'color-worse';
      } else if (value < -1) {
        return 'color-bad';
      } else if (value < 1) {
        return 'color-neutral';
      } else if (value < 5) {
        return 'color-good';
      } else if (value < 10) {
        return 'color-better';
      } else {
        return 'color-best';
      }
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