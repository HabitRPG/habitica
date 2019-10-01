<template lang="pug">
  b-modal#copyAsTodo(:title="$t('copyMessageAsToDo')", :hide-footer="true", size='md')
    .form-group
      input.form-control(type='text', v-model='task.text')
    .form-group
      textarea.form-control(rows='5', v-model='task.notes' focus-element='true')
    hr
    task(v-if='task._id', :isUser="isUser", :task="task")
    .modal-footer
      button.btn.btn-secondary(@click='close()') {{ $t('close') }}
      button.btn.btn-primary(@click='saveTodo()') {{ $t('submit') }}
</template>

<script>
import { mapActions } from '@/libs/store';
import markdownDirective from '@/directives/markdown';
import notificationsMixin from '@/mixins/notifications';
import Task from '@/components/tasks/task';

import taskDefaults from 'common/script/libs/taskDefaults';
import { TAVERN_ID } from '../../../common/script/constants';

const baseUrl = 'https://habitica.com';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
    Task,
  },
  mixins: [notificationsMixin],
  props: ['copyingMessage', 'groupType', 'groupName', 'groupId'],
  data () {
    return {
      isUser: true,
      task: {},
    };
  },
  mounted () {
    this.$root.$on('habitica::copy-as-todo', message => {
      const notes = `${message.user || 'system message'}${message.user ? ' wrote' : ''} in [${this.groupName}](${this.groupPath()})`;
      const newTask = {
        text: message.text,
        type: 'todo',
        notes,
      };
      this.task = taskDefaults(newTask, this.$store.state.user.data);
      this.$root.$emit('bv::show::modal', 'copyAsTodo');
    });
  },
  destroyed () {
    this.$root.$off('habitica::copy-as-todo');
  },
  methods: {
    ...mapActions({
      createTask: 'tasks:create',
    }),
    groupPath () {
      if (this.groupId === TAVERN_ID) {
        return `${baseUrl}/groups/tavern`;
      } else if (this.groupType === 'party') {
        return `${baseUrl}/party`;
      } else {
        return `${baseUrl}/groups/guild/${this.groupId}`;
      }
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'copyAsTodo');
    },
    saveTodo () {
      this.createTask(this.task);
      this.text(this.$t('messageAddedAsToDo'));
      this.$root.$emit('bv::hide::modal', 'copyAsTodo');
    },
  },
};
</script>
