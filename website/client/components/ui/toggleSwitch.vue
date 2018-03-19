<template lang="pug">
.popover-box
  .clearfix(:id="containerId")
    .float-left.toggle-switch-description(v-if="label", :class="hoverText ? 'hasPopOver' : ''") {{ label }}
    .toggle-switch.float-left
      input.toggle-switch-checkbox(
        type='checkbox', :id="toggleId",
        @change="handleChange",
        :checked="isChecked",
        :value="value",
      )
      label.toggle-switch-label(:for="toggleId")
        span.toggle-switch-inner
        span.toggle-switch-switch

  b-popover(
    v-if="hoverText"
    :target="containerId"
    triggers="hover",
    placement="top"
  )
    .popover-content-text {{ hoverText }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .toggle-switch {
    position: relative;
    width: 40px;
    user-select: none;
    margin-left: 9px;
  }

  .toggle-switch-description {
    height: 20px;

    &.hasPopOver {
      border-bottom: 1px dashed $gray-200;
    }
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
    margin-top: 3px;
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
    background-color: $purple-400;
  }

  .toggle-switch-inner:after {
    content: "";
    padding-right: 10px;
    background-color: $gray-200;
    text-align: right;
  }

  .toggle-switch-switch {
    box-shadow: 0 1px 2px 0 rgba($black, 0.32);
    display: block;
    width: 20px;
    margin: -2px;
    margin-top: 1px;
    height: 20px;
    background: $white;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 22px;
    border-radius: 100px;
    transition: all 0.3s ease-in 0s;
  }

  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-inner {
    margin-left: 0;
  }

  .toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-switch {
    right: 0px;
  }
</style>

<script>
export default {
  data () {
    return {
      // The toggle requires a unique id to link it to the label
      toggleId: this.generateId(),
      // The container requires a unique id to link it to the pop-over
      containerId: this.generateId(),
    };
  },
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
    checked: {
      type: Boolean,
      default: false,
    },
    hoverText: {
      type: String,
    },
  },
  computed: {
    isChecked () {
      return this.checked === this.value;
    },
  },
  methods: {
    handleChange ({ target: { checked } }) {
      this.$emit('change', checked);
    },
    generateId () {
      return `id-${Math.random().toString(36).substr(2, 16)}`;
    },
  },
};
</script>

