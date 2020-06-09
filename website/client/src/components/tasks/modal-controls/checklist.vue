<template>
  <div class="checklist-component">
    <label v-once class="mb-1">{{ $t('checklist') }}</label>
    <br>
    <draggable
      v-model="checklist"
      :options="{
        handle: '.grippy',
        filter: '.task-dropdown',
        disabled: disabled,
      }"
      @update="sortedChecklist"
    >
      <div
        v-for="(item, $index) in checklist"
        :key="item.id"
        class="inline-edit-input-group checklist-group input-group"
      >
        <span
          class="grippy"
          v-html="icons.grip"
          v-if="!disabled"
        >
        </span>

          <checkbox :checked.sync="item.completed"
                    :disabled="disabled"
                    class="input-group-prepend"
                    :class="{'cursor-auto': disabled}"
                    :id="`checklist-${item.id}`"/>

        <input
          v-model="item.text"
          class="inline-edit-input checklist-item form-control"
          type="text"
          :disabled="disabled"
        >
        <span
          class="input-group-append"
          v-if="!disabled"
          @click="removeChecklistItem($index)"
        >
          <div
            class="svg-icon destroy-icon"
            v-html="icons.destroy"
          ></div>
        </span>
      </div>
    </draggable>
    <div
      class="inline-edit-input-group checklist-group input-group new-checklist"
      v-if="!disabled"
    >
      <span class="input-group-prepend new-icon"
           v-html="icons.positive">

      </span>

      <input
        v-model="newChecklistItem"
        class="inline-edit-input checklist-item form-control"
        type="text"
        :placeholder="$t('newChecklistItem')"
        @keypress.enter="setHasPossibilityOfIMEConversion(false)"
        @keyup.enter="addChecklistItem($event)"
      >
    </div>
  </div>
</template>

<script>
// import clone from 'lodash/clone';
import draggable from 'vuedraggable';
import uuid from 'uuid';

import positiveIcon from '@/assets/svg/positive.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import chevronIcon from '@/assets/svg/chevron.svg';
import gripIcon from '@/assets/svg/grip.svg';
import checkbox from '@/components/ui/checkbox';

export default {
  components: {
    draggable,
    checkbox,
  },
  name: 'checklist',
  data () {
    return {
      checklist: this.items,
      hasPossibilityOfIMEConversion: true,
      newChecklistItem: null,
      icons: Object.freeze({
        positive: positiveIcon,
        destroy: deleteIcon,
        chevron: chevronIcon,
        grip: gripIcon,
      }),
    };
  },
  props: {
    disabled: {
      type: Boolean,
    },
    items: {
      type: Array,
    },
  },
  methods: {
    sortedChecklist () {
      this.updateChecklist();
    },
    updateChecklist () {
      this.$emit('update:items', this.checklist);
      console.info('pushed items');
    },
    setHasPossibilityOfIMEConversion (bool) {
      this.hasPossibilityOfIMEConversion = bool;
    },
    addChecklistItem (e) {
      if (e) e.preventDefault();
      if (this.hasPossibilityOfIMEConversion) return;
      const checkListItem = {
        id: uuid.v4(),
        text: this.newChecklistItem,
        completed: false,
      };
      this.checklist.push(checkListItem);
      this.newChecklistItem = null;
      this.setHasPossibilityOfIMEConversion(true);
      this.updateChecklist();
    },
    removeChecklistItem (i) {
      this.checklist.splice(i, 1);
      this.updateChecklist();
    },
  },
};
</script>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .checklist-component {

    .checklist-group {
      border-top: 1px solid $gray-500;

      &.new-checklist {
        border-bottom: 1px solid $gray-500;
      }

      .input-group-append {
        background: inherit;
      }

      .checklist-item {
        padding-left: 12px;
      }

      .new-icon {
        cursor: default;
        margin-left: 3px;
        margin-right: -3px;

        svg {
          width: 1rem;
          height: 1rem;
          object-fit: contain;
          fill: $gray-200;
        }
      }
    }

    span.grippy {
      position: absolute;
      left: -15px;
      width: 0.625rem;
      height: 1rem;
      object-fit: contain;
      color: $gray-200;
      top: 4px;
    }

    .checklist-item {
      margin-bottom: 0px;
      border-radius: 0px;
      border: none !important;
      padding-left: 36px;
    }

    .checklist-group {
      .grippy {
        opacity: 0;
        cursor: pointer;

        &:hover, &:active {
          opacity: 1;
        }
      }

      .destroy-icon {
        display: none;
      }

      &:hover {
        cursor: text;

        .destroy-icon {
          display: inline-block;
          color: $gray-200;

          &:hover {
            color: $maroon-50;
          }
        }

        .grippy {
          display: inline-block;
          opacity: 1;
        }
      }
    }
  }
</style>
