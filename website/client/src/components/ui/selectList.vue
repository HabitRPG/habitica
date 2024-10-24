<template>
  <div>
    <b-dropdown
      class="select-list"
      :class="{'inline-dropdown':inlineDropdown}"
      :toggle-class="isOpened ? 'active' : null"
      :disabled="disabled"
      :right="right"
      @show="isOpened = true"
      @hide="isOpened = false"
    >
      <template #button-content>
        <slot
          name="item"
          :item="selected || placeholder"
          :button="true"
        >
          <!-- Fallback content -->
          {{ value }}
        </slot>
      </template>
      <b-dropdown-item
        v-for="item in items"
        :key="getKeyProp(item)"
        :disabled="isDisabled(item)"
        :active="isSelected(item)"
        :class="{
          active: isSelected(item),
          selectListItem: true,
          showIcon: !hideIcon && isSelected(item)
        }"
        @click="selectItem(item)"
      >
        <slot
          name="item"
          :item="item"
          :button="false"
        >
          <!-- Fallback content -->
          {{ item }}
        </slot>

        <div
          v-once
          class="svg-icon color check-icon"
          v-html="icons.check"
        ></div>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.select-list ::v-deep {
  .dropdown-toggle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 25px; /* To allow enough room for the down arrow to be displayed */
  }

  .selectListItem {
    position: relative;

    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &:not(.showIcon) {
      .svg-icon.check-icon {
        display: none;
      }
    }

    .svg-icon.check-icon.color {
      margin-left: 10px; /* So the flex item (checkmark) will have some spacing from the text */
      width: 0.77rem;
      height: 0.615rem;
      color: $purple-300;
    }
  }
}
</style>

<script>
import svgCheck from '@/assets/svg/check.svg';

export default {
  props: {
    items: {
      type: Array,
    },
    disabled: {
      type: Boolean,
    },
    value: [String, Number, Object],
    keyProp: {
      type: String,
    },
    activeKeyProp: {
      type: String,
    },
    directSelect: {
      type: Boolean,
      default: false,
    },
    disabledProp: {
      type: String,
    },
    hideIcon: {
      type: Boolean,
    },
    right: {
      type: Boolean,
    },
    inlineDropdown: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
    },
  },
  data () {
    return {
      isOpened: false,
      selected: this.value,
      icons: Object.freeze({
        check: svgCheck,
      }),
    };
  },
  methods: {
    getKeyProp (item) {
      return this.keyProp ? item[this.keyProp] : item.key || item.identifier;
    },
    isDisabled (item) {
      return typeof item[this.disabledProp] === 'undefined' ? false : item[this.disabledProp];
    },
    selectItem (item) {
      if (this.directSelect) {
        this.selected = item;
      } else {
        this.selected = this.getKeyProp(item);
      }
      this.$emit('select', item);
    },
    isSelected (item) {
      if (this.activeKeyProp) {
        return item[this.activeKeyProp] === this.selected;
      }

      return item === this.selected;
    },
  },
};
</script>
