<template lang="pug">
form(
  v-if="task",
  @submit.stop.prevent="save()",
)
  b-modal#edit-task-modal(
    size="sm",
    @hide="cancel",
  )
    .task-modal-header(
      slot="modal-header",
      :class="[cssClass]",
    )
      h1(v-once) {{ title }}
      .form-group
        label(v-once) {{ `${$t('title')}*` }}
        input.form-control(type='text', :class="[`${cssClass}-modal-input`]", required, :value="task.text")
      .form-group
        label(v-once) {{ $t('notes') }}
        textarea.form-control(required, :class="[`${cssClass}-modal-input`]", :value="task.notes")
    .task-modal-content
      p content
      p another piece of content
    .task-modal-footer(slot="modal-footer")
      button.btn.btn-primary(type="submit", v-once) {{ $t('save') }}
      span.delete-task-btn(v-once, @click="destroy()") {{ $t('delete') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#edit-task-modal {
  .modal-dialog.modal-sm {
    max-width: 448px;
  }

  label {
    font-weight: bold;
  }

  input, textarea {
    border: none;
    background-color: rgba(0, 0, 0, 0.16);

    &:focus {
      color: $white !important;
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
  }

  .task-modal-footer {
    margin: 0 auto;
    padding-bottom: 24px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    .delete-task-btn {
      margin-left: 16px;
      color: $red-50;
      cursor: pointer;

      &:hover, &:focus, &:active {
        text-decoration: underline;
      }
    }
  }
}
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import { capitalizeFirstLetter } from 'client/libs/string';
import { mapGetters } from 'client/libs/store';

export default {
  components: {
    bModal,
  },
  props: ['task'],
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
    }),
    title () {
      const type = capitalizeFirstLetter(this.task.type);
      return this.$t('editATask', {type});
    },
    cssClass () {
      return this.getTaskClasses(this.task, 'editModal');
    },
  },
  methods: {
    save () {

    },
    destroy () {

    },
    cancel () {
      // TODO canel
    },
  },
};
</script>