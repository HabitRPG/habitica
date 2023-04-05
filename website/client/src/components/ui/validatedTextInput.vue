<template>
  <div>
    <div
      v-if="settingsLabel"
      class="settings-label"
    >
      {{ $t(settingsLabel) }}
    </div>
    <div class="form-group">
      <div
        class="input-group"
        :class="{
          'is-valid': canChangeClasses && isValid,
          'is-invalid': canChangeClasses && !isValid
        }"
      >
        <input
          :value="value"
          class="form-control"
          type="text"
          :class="{
            'is-invalid input-invalid': canChangeClasses && !isValid,
            'is-valid input-valid': canChangeClasses && isValid
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
