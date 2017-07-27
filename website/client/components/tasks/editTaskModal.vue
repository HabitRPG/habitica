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
        textarea.form-control(required, :class="[`${cssClass}-modal-input`]", :value="task.notes", rows="3")
    .task-modal-content
      .d-flex.justify-content-center(v-if="task.type === 'habit'")
        .option-item(:class="{'option-item-selected': task.up === true}", @click="task.up = !task.up")
          .option-item-box
            .svg-icon.difficulty-trivial-icon(v-html="icons.positive")
          .option-item-label(v-once) {{ $t('positive') }}
        .option-item(:class="{'option-item-selected': task.down === true}", @click="task.down = !task.down")
          .option-item-box
            .svg-icon.difficulty-trivial-icon(v-html="icons.negative")
          .option-item-label(v-once) {{ $t('negative') }}
      label(v-once) 
        span.float-left {{ $t('difficulty') }}
        .svg-icon.info-icon(v-html="icons.information")
      .d-flex.justify-content-center
        .option-item(:class="{'option-item-selected': task.priority === 0.1}", @click="task.priority = 0.1")
          .option-item-box
            .svg-icon.difficulty-trivial-icon(v-html="icons.difficultyTrivial")
          .option-item-label(v-once) {{ $t('trivial') }}
        .option-item(:class="{'option-item-selected': task.priority === 1}", @click="task.priority = 1")
          .option-item-box
            .svg-icon.difficulty-normal-icon(v-html="icons.difficultyNormal")
          .option-item-label(v-once) {{ $t('easy') }}
        .option-item(:class="{'option-item-selected': task.priority === 1.5}", @click="task.priority = 1.5")
          .option-item-box
            .svg-icon.difficulty-medium-icon(v-html="icons.difficultyMedium")
          .option-item-label(v-once) {{ $t('medium') }}
        .option-item(:class="{'option-item-selected': task.priority === 2}", @click="task.priority = 2")
          .option-item-box
            .svg-icon.difficulty-hard-icon(v-html="icons.difficultyHard")
          .option-item-label(v-once) {{ $t('hard') }}
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

  .info-icon {
    float: left;
    height: 16px;
    width: 16px;
    margin-left: 8px;
    margin-top: 2px;
  }

  .difficulty-trivial-icon {
    width: 16px;
    height: 16px;
  }

  .difficulty-normal-icon {
    width: 36px;
    height: 16px;
  }

  .difficulty-medium-icon {
    width: 36px;
    height: 32px;
  }

  .difficulty-hard-icon {
    width: 36px;
    height: 36px;
  }

  .option-item {
    margin-right: 48px;

    &:last-child {
      margin-right: 0px;
    }

    &-box {
      width: 64px;
      height: 64px;
      border-radius: 2px;
      background: $gray-600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-label {
      color: $gray-50;
      text-align: center;
    }
  }

  .task-modal-footer {
    margin: 0 auto;
    padding-bottom: 24px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    margin-top: 50px;

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
import informationIcon from 'assets/svg/information.svg';
import difficultyTrivialIcon from 'assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from 'assets/svg/difficulty-medium.svg';
import difficultyHardIcon from 'assets/svg/difficulty-hard.svg';
import difficultyNormalIcon from 'assets/svg/difficulty-normal.svg';

export default {
  components: {
    bModal,
  },
  props: ['task'],
  data () {
    return {
      icons: Object.freeze({
        information: informationIcon,
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
      }),
    };
  },
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
      this.$root.$emit('hide::modal', 'edit-task-modal');
    },
    destroy () {
      this.$root.$emit('hide::modal', 'edit-task-modal');
    },
    cancel () {
      this.$emit('cancel');
    },
  },
};
</script>