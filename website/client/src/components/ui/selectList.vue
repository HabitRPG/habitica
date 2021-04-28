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
          :item="selected"
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
    }

    .selectListItem {
      position: relative;
      padding-right: 1.625rem;

      &:not(.showIcon) {
        .svg-icon.check-icon {
          display: none;
        }
      }

      .svg-icon.check-icon.color {
        position: absolute;
        right: 0.855rem;
        top: 0.688rem;
        bottom: 0.688rem;
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
