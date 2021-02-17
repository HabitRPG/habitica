<template>
  <div class="popover-box">
    <div
      class="clearfix toggle-switch-outer"
    >
      <div
        v-if="label"
        class="float-left toggle-switch-description"
        :class="{'bold': boldLabel}"
      >
        <span>{{ label }}</span>
      </div>
      <span
        v-if="hoverText"
        :id="containerId"
        class="svg-icon inline icon-16  float-left"
        v-html="icons.information"
      >

      </span>
      <div class="toggle-switch float-left">
        <input
          :id="toggleId"
          class="toggle-switch-checkbox"
          type="checkbox"
          :checked="isChecked"
          :value="value"
          @change="handleChange"
        >
        <label
          class="toggle-switch-label"
          :for="toggleId"
        >
          <span class="toggle-switch-inner"></span>
          <span
            class="toggle-switch-switch"
            tabindex="0"
            @focus="handleFocus"
            @blur="handleBlur"
            @keyup.space="handleSpace"
          ></span>
        </label>
      </div>
    </div>
    <b-popover
      v-if="hoverText"
      :target="containerId"
      triggers="hover"
      placement="top"
    >
      <div class="popover-content-text">
        {{ hoverText }}
      </div>
    </b-popover>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .toggle-switch-outer {
    display: flex;
    align-items: center;
  }

  .toggle-switch {
    position: relative;
    width: 40px;
    user-select: none;
    margin-left: 0.5rem;
  }

  .toggle-switch-description {
    &.hasPopOver span {
      border-bottom: 1px dashed $gray-200;
    }
  }

  .svg-icon {
    margin: 2px 0.5rem 2px 0.5rem;
  }

  .toggle-switch-checkbox {
    display: none;
  }

  .toggle-switch-label {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border-radius: 100px;
    margin-bottom: 0px;
    margin-top: 2px;
  }

  .toggle-switch-inner {
    display: block;
    width: 200%;
    margin-left: -100%;
    transition: margin 0.3s ease-in 0s;
  }

  .toggle-switch-inner:before, .toggle-switch-inner:after {
    display: block;
    float: left;
    width: 50%;
    height: 16px;
    padding: 0;
  }

  .toggle-switch-inner:before {
    content: "";
    padding-left: 10px;
    background-color: $green-50;
  }

  .toggle-switch-inner:after {
    content: "";
    padding-right: 10px;
    background-color: $gray-300;
    text-align: right;
  }

  .toggle-switch-switch {
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    display: block;
    width: 20px;
    margin: -2px;
    margin-top: 0;
    height: 20px;
    background: $white;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 22px;
    border-radius: 100px;
    transition: all 0.3s ease-in 0s;

    &:focus {
      border: 1px solid $purple-400;
      outline: none;
    }
  }

  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-inner {
    margin-left: 0;
  }

  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-switch {
    right: 0px;
  }

  .bold {
    font-weight: bold;
  }
</style>

<script>
import svgInformation from '@/assets/svg/information.svg';

export default {
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    value: {
      default: true,
    },
    label: {
      type: String,
    },
    boldLabel: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    hoverText: {
      type: String,
    },
  },
  data () {
    return {
      // The toggle requires a unique id to link it to the label
      toggleId: this.generateId(),
      // The container requires a unique id to link it to the pop-over
      containerId: this.generateId(),
      focused: false,

      icons: Object.freeze({
        information: svgInformation,
      }),
    };
  },
  computed: {
    isChecked () {
      return this.checked === this.value;
    },
  },
  methods: {
    handleBlur () {
      this.focused = false;
    },
    handleChange ({ target: { checked } }) {
      this.$emit('change', checked);
    },
    handleFocus () {
      this.focused = true;
    },
    handleSpace () {
      if (this.focused) {
        document.getElementById(this.toggleId).click();
      }
    },
    generateId () {
      return `id-${Math.random().toString(36).substr(2, 16)}`;
    },
  },
};
</script>
