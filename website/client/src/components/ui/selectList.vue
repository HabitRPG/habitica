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
      <template v-slot:button-content>
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
        :key="keyProp ? item[keyProp] : item"
        :disabled="typeof item[disabledProp] === 'undefined' ? false : item[disabledProp]"
        :active="item === selected"
        :class="{
          active: item === selected,
          selectListItem: true,
          showIcon: !hideIcon && item === selected
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
    selectItem (item) {
      this.selected = item;
      this.$emit('select', item);
    },
  },
};
</script>
