<template>
  <b-modal
    id="copyAsTodo"
    :title="$t('copyMessageAsToDo')"
    :hide-footer="true"
    size="md"
  >
    <div class="form-group">
      <input
        v-model="task.text"
        class="form-control"
        type="text"
      >
    </div>
    <div class="form-group">
      <textarea
        v-model="task.notes"
        class="form-control"
        rows="5"
        focus-element="true"
      ></textarea>
    </div>
    <hr>
    <task
      v-if="task._id"
      :is-user="isUser"
      :task="task"
    />
    <div class="modal-footer">
      <button
        class="btn btn-secondary"
        @click="close()"
      >
        {{ $t('close') }}
      </button>
      <button
        class="btn btn-primary"
        @click="saveTodo()"
      >
        {{ $t('submit') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
import { mapActions } from '@/libs/store';
import markdownDirective from '@/directives/markdown';
import notificationsMixin from '@/mixins/notifications';
import Task from '@/components/tasks/task';

import taskDefaults from '@/../../common/script/libs/taskDefaults';

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
  beforeDestroy () {
    this.$root.$off('habitica::copy-as-todo');
  },
  methods: {
    ...mapActions({
      createTask: 'tasks:create',
    }),
    groupPath () {
      if (this.groupType === 'party') {
        return `${baseUrl}/party`;
      }
      return `${baseUrl}/groups/guild/${this.groupId}`;
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
