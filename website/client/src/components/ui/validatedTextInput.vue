<template>
  <div>
    <div class="label-line">
      <div
        v-if="settingsLabel"
        class="settings-label"
      >
        {{ $t(settingsLabel) }}
      </div>

      <slot name="top-right"></slot>
    </div>

    <div class="form-group">
      <div
        class="input-group"
        :class="{
          'is-valid': validStyle,
          'is-invalid': invalidStyle
        }"
      >
        <input
          :value="value"
          class="form-control"
          :type="inputType"
          :class="{
            'is-invalid input-invalid': invalidStyle,
            'is-valid input-valid': validStyle
          }"
          :readonly="readonly"
          :aria-readonly="readonly"

          :placeholder="placeholder"
          @keyup="handleChange"
          @blur="$emit('blur')"
        >
      </div>
      <div
        v-for="issue in invalidIssues"
        :key="issue"
        class="input-error"
      >
        {{ issue }} &nbsp;
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ValidatedTextInput',
  model: {
    prop: 'value',
    event: 'update:value',
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    isValid: {
      type: Boolean,
      default: false,
    },
    onlyShowInvalidState: {
      type: Boolean,
      default: false,
    },
    inputType: {
      type: String,
      default: 'text',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    settingsLabel: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    invalidIssues: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      wasChanged: false,
    };
  },
  computed: {
    canChangeClasses () {
      return !this.readonly && this.wasChanged;
    },
    validStyle () {
      return this.canChangeClasses && this.isValid && !this.onlyShowInvalidState;
    },
    invalidStyle () {
      return this.canChangeClasses && !this.isValid;
    },
  },
  methods: {
    handleChange ({ target: { value } }) {
      this.wasChanged = true;
      this.$emit('update:value', value);
    },
  },
};
</script>

<style lang="scss" scoped>
.label-line {
  display: flex;
}

.settings-label {
  flex: 1;
}

.input-error {
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 0;
}

</style>
