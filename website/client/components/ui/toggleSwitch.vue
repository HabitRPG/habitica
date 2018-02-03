<template lang="pug">
.clearfix.toggle-switch-container
  .float-left.toggle-switch-description {{ label }}
  .toggle-switch.float-left
    input.toggle-switch-checkbox(
      type='checkbox', :id="id",
      @change="handleChange",
      :checked="isChecked",
      :value="value",
    )
    label.toggle-switch-label(:for="id")
      span.toggle-switch-inner
      span.toggle-switch-switch
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .toggle-switch-container {
    margin-top: 6px;
  }

  .toggle-switch {
    position: relative;
    width: 40px;
    user-select: none;
    margin-left: 9px;
  }

  .toggle-switch-description {
    height: 20px;
    border-bottom: 1px dashed $gray-200;
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
      // A value is required for the required for the for and id attributes
      id: Math.random(),
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
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
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
  },
};
</script>
