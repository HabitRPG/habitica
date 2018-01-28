<template lang="pug">
  b-modal#copyAsTodo(:title="$t('copyMessageAsToDo')", :hide-footer="true", size='md')
    .form-group
      input.form-control(type='text', v-model='text')
    .form-group
      textarea.form-control(rows='5', v-model='notes' focus-element='true')

    hr

    // @TODO: Implement when tasks are done
    //div.task-column.preview
      div(v-init='popoverOpen = false', class='task todo uncompleted color-neutral', popover-trigger='mouseenter', data-popover-html="{{popoverOpen ? '' : notes | markdown}}", popover-placement="top")
        .task-meta-controls
          span(v-if='!obj._locked')
            span.task-notes(v-show='notes', @click='popoverOpen = !popoverOpen', popover-trigger='click', data-popover-html="{{notes | markdown}}", popover-placement="top")
              span.glyphicon.glyphicon-comment
              | &nbsp;

        div.task-text
          div(v-markdown='text', target='_blank')

    .modal-footer
      button.btn.btn-secondary(@click='close()') {{ $t('close') }}
      button.btn.btn-primary(@click='saveTodo()') {{ $t('submit') }}
</template>

<script>
import markdownDirective from 'client/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  props: ['copyingMessage', 'groupName', 'groupId'],
  data () {
    return {
      text: '',
      notes: '',
    };
  },
  watch: {
    copyingMessage () {
      this.text = this.copyingMessage.text;
      let baseUrl = 'https://habitica.com';
      this.notes = `[${this.copyingMessage.user}](${baseUrl}/static/home/#?memberId=${this.copyingMessage.uuid}) wrote in [${this.groupName}](${baseUrl}/groups/guild/${this.groupId})`;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'copyAsTodo');
    },
    saveTodo () {
      // let newTask = {
      //   text: this.text,
      //   type: 'todo',
      //   notes: this.notes,
      // };

      //  @TODO: Add after tasks: User.addTask({body:newTask});
      // @TODO: Notification.text(window.env.t('messageAddedAsToDo'));

      this.$root.$emit('bv::hide::modal', 'copyAsTodo');
    },
  },
};
</script>
