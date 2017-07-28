<template lang="pug">
form(
  v-if="task",
  @submit.stop.prevent="submit()",
)
  b-modal#task-modal(
    size="sm",
    @hidden="cancel()",
  )
    .task-modal-header(
      slot="modal-header",
      :class="[cssClass]",
    )
      h1 {{ title }}
      .form-group
        label(v-once) {{ `${$t('title')}*` }}
        input.form-control(type='text', :class="[`${cssClass}-modal-input`]", required, v-model="task.text")
      .form-group
        label(v-once) {{ $t('notes') }}
        textarea.form-control(:class="[`${cssClass}-modal-input`]", v-model="task.notes", rows="3")
    .task-modal-content
      .d-flex.justify-content-center(v-if="task.type === 'habit'")
        .option-item(:class="{'option-item-selected': task.up === true}", @click="task.up = !task.up")
          .option-item-box
            .task-control.habit-control(:class="controlClass.up + '-control-habit'")
              .svg-icon.positive(v-html="icons.positive")
          .option-item-label(v-once) {{ $t('positive') }}
        .option-item(:class="{'option-item-selected': task.down === true}", @click="task.down = !task.down")
          .option-item-box
            .task-control.habit-control(:class="controlClass.down + '-control-habit'")
              .svg-icon.negative(v-html="icons.negative")
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
      .option
        label(v-once) {{ $t('tags') }}
        .category-wrap(@click="showTagsSelect = !showTagsSelect")
          span.category-select(v-if='task.tags.length === 0') {{$t('none')}}
          .category-label(v-for="tag in getTagsFor(task)") {{tag}}
        .category-box(v-if="showTagsSelect")
          .form-check(
            v-for="tag in user.tags",
            :key="tag.id",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value="tag.id", v-model="task.tags")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ tag.name }}
          button.btn.btn-primary(@click="showTagsSelect = !showTagsSelect") {{$t('close')}}
      .option(v-if="task.type === 'habit'")
        label(v-once) {{ $t('resetStreak') }}
        b-dropdown(:text="task.frequency")
          b-dropdown-item(v-for="frequency in ['daily', 'weekly', 'monthly']", :key="frequency", @click="task.frequency = frequency")
            | {{frequency}}


    .task-modal-footer(slot="modal-footer")
      button.btn.btn-primary(type="submit", v-once) {{ $t('save') }}
      span.cancel-task-btn(v-once, v-if="purpose === 'create'", @click="cancel()") {{ $t('cancel') }}
      span.delete-task-btn(v-once, v-else, @click="destroy()") {{ $t('delete') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

#task-modal {
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

  .option {
    position: relative;
  }

  .option-item {
    margin-right: 48px;
    cursor: pointer;

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

      .habit-control.task-habit-disabled-control-habit {
        color: $white !important;
        border: none;
        background: $gray-300;
      }
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

    .delete-task-btn, .cancel-task-btn {
      margin-left: 16px;
      cursor: pointer;

      &:hover, &:focus, &:active {
        text-decoration: underline;
      }
    }

    .delete-task-btn {
      color: $red-50;
    }

    .cancel-task-btn {
      color: $blue-10;
    }
  }
}
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import { mapGetters, mapActions, mapState } from 'client/libs/store';
import informationIcon from 'assets/svg/information.svg';
import difficultyTrivialIcon from 'assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from 'assets/svg/difficulty-medium.svg';
import difficultyHardIcon from 'assets/svg/difficulty-hard.svg';
import difficultyNormalIcon from 'assets/svg/difficulty-normal.svg';
import positiveIcon from 'assets/svg/positive.svg';
import negativeIcon from 'assets/svg/negative.svg';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

export default {
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
  },
  props: ['task', 'purpose'], // purpose is either create or edit, task is the task created or edited
  data () {
    return {
      showTagsSelect: false,
      icons: Object.freeze({
        information: informationIcon,
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
        negative: negativeIcon,
        positive: positiveIcon,
      }),
    };
  },
  computed: {
    ...mapGetters({
      getTaskClasses: 'tasks:getTaskClasses',
      getTagsFor: 'tasks:getTagsFor',
    }),
    ...mapState({user: 'user.data'}),
    title () {
      const type = this.$t(this.task.type);
      return this.$t(this.purpose === 'edit' ? 'editATask' : 'createTask', {type});
    },
    cssClass () {
      return this.getTaskClasses(this.task, this.purpose === 'edit' ? 'editModal' : 'createModal');
    },
    controlClass () {
      return this.getTaskClasses(this.task, this.purpose === 'edit' ? 'control' : 'controlCreate');
    },
  },
  methods: {
    ...mapActions({saveTask: 'tasks:save', destroyTask: 'tasks:destroy', createTask: 'tasks:create'}),
    submit () {
      if (this.purpose === 'create') {
        this.createTask(this.task);
      } else {
        this.saveTask(this.task);
      }
      this.$root.$emit('hide::modal', 'task-modal');
    },
    destroy () {
      this.destroyTask(this.task);
      this.$root.$emit('hide::modal', 'task-modal');
    },
    cancel () {
      this.showTagsSelect = false;
      this.$emit('cancel');
    },
  },
};
</script>