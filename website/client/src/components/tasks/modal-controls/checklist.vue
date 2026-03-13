<template>
  <div class="checklist-component">
    <div
      class="d-flex"
    >
      <lockable-label
        :locked="disabled"
        :text="$t('checklist')"
      />
      <div
        class="svg-icon icon-16 my-auto ml-auto pointer"
        :class="{'chevron-flip': showChecklist}"
        @click="showChecklist = !showChecklist"
        v-html="icons.chevron"
      >
      </div>
    </div>
    <b-collapse
      id="checklistCollapse"
      v-model="showChecklist"
    >
      <draggable
        v-model="checklist"
        handle=".grippy"
        filter=".task-dropdown"
        :disabled="disabled"
        @update="updateChecklist"
      >
        <div
          v-for="(item, $index) in checklist"
          :key="item.id"
          class="inline-edit-input-group checklist-group input-group"
        >
          <span
            v-if="!disabled && !disableDrag"
            class="grippy"
            v-html="icons.grip"
          >
          </span>

          <checkbox
            v-if="!disableEdit"
            :id="`checklist-${item.id}`"
            :checked.sync="item.completed"
            :disabled="disabled"
            class="input-group-prepend"
            :class="{'cursor-auto': disabled}"
          />

          <input
            :ref="'checklistItem-' + $index"
            v-model="item.text"
            class="inline-edit-input checklist-item form-control"
            type="text"
            :disabled="disabled || disableEdit"
            :class="summaryClass(item)"
            @focus="setActiveItem($index)"
            @keydown="autoCompleteMixinUpdateCarretPosition"
            @keydown.tab="autoCompleteMixinHandleTab($event)"
            @keydown.up="autoCompleteMixinSelectPreviousAutocomplete($event)"
            @keydown.down="autoCompleteMixinSelectNextAutocomplete($event)"
            @keypress.enter="autoCompleteMixinSelectAutocomplete($event)"
            @keydown.esc="autoCompleteMixinHandleEscape($event)"
          >
          <span
            v-if="!disabled && !disableEdit"
            class="input-group-append"
            @click="removeChecklistItem($index)"
          >
            <div
              v-once
              class="svg-icon destroy-icon"
              v-html="icons.destroy"
            >
            </div>
          </span>
        </div>
      </draggable>
      <div
        v-if="!disabled && !disableEdit"
        class="inline-edit-input-group checklist-group input-group new-checklist"
        :class="{'top-border': items.length === 0}"
      >
        <span
          v-once
          class="input-group-prepend new-icon"
          v-html="icons.positive"
        >
        </span>

        <input
          ref="newChecklistInput"
          v-model="newChecklistItem"
          class="inline-edit-input checklist-item form-control"
          type="text"
          :placeholder="$t('newChecklistItem')"
          @focus="setActiveItem(-1)"
          @keydown="autoCompleteMixinUpdateCarretPosition"
          @keydown.tab="autoCompleteMixinHandleTab($event)"
          @keydown.up="autoCompleteMixinSelectPreviousAutocomplete($event)"
          @keydown.down="autoCompleteMixinSelectNextAutocomplete($event)"
          @keypress.enter="newChecklistEnterHandler($event)"
          @keyup.enter="addChecklistItem($event, true)"
          @keydown.esc="autoCompleteMixinHandleEscape($event)"
          @blur="addChecklistItem($event, false)"
        >
      </div>
      <emoji-auto-complete
        ref="emojiAutocomplete"
        :text="activeFieldText"
        :textbox="textbox"
        :coords="mixinData.autoComplete.coords"
        :caret-position="mixinData.autoComplete.caretPosition"
        @select="selectedAutocomplete"
      />
    </b-collapse>
  </div>
</template>

<script>
// import clone from 'lodash/clone';
import draggable from 'vuedraggable';
import { v4 as uuid } from 'uuid';

import positiveIcon from '@/assets/svg/positive.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import chevronIcon from '@/assets/svg/chevron.svg?raw';
import gripIcon from '@/assets/svg/grip.svg?raw';
import checkbox from '@/components/ui/checkbox';
import lockableLabel from './lockableLabel';
import emojiAutoComplete from '@/components/chat/emojiAutoComplete';
import { autoCompleteHelperMixin } from '@/mixins/autoCompleteHelper';

export default {
  name: 'Checklist',
  components: {
    checkbox,
    draggable,
    lockableLabel,
    emojiAutoComplete,
  },
  mixins: [autoCompleteHelperMixin],
  props: {
    disabled: {
      type: Boolean,
    },
    disableDrag: {
      type: Boolean,
    },
    disableEdit: {
      type: Boolean,
    },
    items: {
      type: Array,
    },
  },
  data () {
    return {
      checklist: this.items,
      showChecklist: true,
      hasPossibilityOfIMEConversion: true,
      newChecklistItem: null,
      textbox: null,
      activeItemIndex: -1,
      icons: Object.freeze({
        positive: positiveIcon,
        destroy: deleteIcon,
        chevron: chevronIcon,
        grip: gripIcon,
      }),
    };
  },
  computed: {
    activeFieldText () {
      if (this.activeItemIndex === -1) {
        return this.newChecklistItem || '';
      }
      const item = this.checklist[this.activeItemIndex];
      return item ? item.text || '' : '';
    },
  },
  methods: {
    summaryClass (item) {
      if (!this.disableEdit) return '';
      if (item.completed) return 'summary-completed';
      return 'summary-incomplete';
    },
    updateChecklist () {
      this.$emit('update:items', this.checklist);
    },
    setHasPossibilityOfIMEConversion (bool) {
      this.hasPossibilityOfIMEConversion = bool;
    },
    addChecklistItem (e, checkIME) {
      if (e) {
        e.preventDefault();
      }

      const newChecklistItemText = (this.newChecklistItem || '').trim();

      if ((checkIME && this.hasPossibilityOfIMEConversion)
        || !newChecklistItemText) {
        return;
      }

      const checkListItem = {
        id: uuid(),
        text: newChecklistItemText,
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
    setActiveItem (index) {
      this.activeItemIndex = index;
      if (index === -1) {
        this.textbox = this.$refs.newChecklistInput;
      } else {
        const refArr = this.$refs[`checklistItem-${index}`];
        this.textbox = refArr ? refArr[0] || refArr : null;
      }
    },
    newChecklistEnterHandler (e) {
      const ac = this._getActiveAutocomplete();
      if (ac && ac.selected !== null) {
        e.preventDefault();
        ac.makeSelection();
      } else if (ac) {
        ac.cancel();
        this.setHasPossibilityOfIMEConversion(false);
      } else {
        this.setHasPossibilityOfIMEConversion(false);
      }
    },
    selectedAutocomplete (newText, newCaret) {
      if (this.activeItemIndex === -1) {
        this.newChecklistItem = newText;
      } else {
        this.checklist[this.activeItemIndex].text = newText;
      }
      this.$nextTick(() => {
        if (this.textbox) {
          this.textbox.setSelectionRange(newCaret, newCaret);
          this.textbox.focus();
        }
      });
    },
  },
};
</script>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  .checklist-component {
    position: relative;

    .chevron-flip {
      transform: translateY(-5px) rotate(180deg);
    }

    .lock-icon {
      color: $gray-200;
    }

    .pointer {
      cursor: pointer;
    }

    .top-border {
      border-top: 1px solid $gray-500;
    }

    .checklist-group {
      height: 2rem;
      border-bottom: 1px solid $gray-500;

      &:first-of-type {
        border-top: 1px solid $gray-500;
      }

      .inline-edit-input  {
        padding-left: 0.75rem;
      }

      .input-group-prepend {
        margin-left: 0.375rem;
        margin-top: 0.375rem;
        margin-right: 0;
        padding: 0;
        &:not(.new-icon) {
          width: 1.125rem;
          height: 1.125rem;
        }
        &.new-icon {
          margin-left: 0.688rem;
          margin-top: 0.625rem;
          margin-bottom: 0.625rem;
          height: 10px;
          width: 13px;
        }
      }

      .input-group-append,
      .input-group-prepend {
        background: inherit;
      }

      .checklist-item {
        padding: 0;
        margin-left: 0.75rem;
        margin-top: 0.188rem;
        margin-bottom: 0.25rem;
        height: 1.5rem;
        font-size: 14px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.71;
        letter-spacing: normal;
        color: $gray-50;
      }

      .new-icon {
        cursor: default;

        svg {
          width: 0.625rem;
          height: 0.625rem;
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

      &.summary-incomplete {
        opacity: 1;
      }
      &.summary-completed {
        text-decoration: line-through;
      }
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
