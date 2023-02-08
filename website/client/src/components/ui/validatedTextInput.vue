<template>
  <div class="input-area">
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
          'is-valid': wasChanged && isValid,
          'is-invalid': wasChanged && !isValid
        }"
      >
        <input
          :value="value"
          class="form-control"
          type="text"
          :class="{
            'is-invalid input-invalid': wasChanged && !isValid,
            'is-valid input-valid': wasChanged && isValid
          }"

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

</style>
