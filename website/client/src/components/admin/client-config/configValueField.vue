<template>
  <div>
    <input
      v-if="type == 'number'"
      type="number"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="inputValue($event.target.value)"
    >
    <select
      v-else-if="type == 'boolean'"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @change="inputValue(parseBoolean($event.target.value))"
    >
      <option :selected="value === null" :value="null">---</option>
      <option :selected="value === true" :value="true">True</option>
      <option :selected="value === false" :value="false">False</option>
    </select>
    <textarea
      v-else-if="type == 'json'"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      rows="8"
      @input="inputValue($event.target.value)"
    ></textarea>
    <input
      v-else-if="type == 'email'"
      type="email"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="inputValue($event.target.value)"
    >
    <input
      v-else-if="type == 'url'"
      type="url"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="inputValue($event.target.value)"
    >
    <input
      v-else-if="type == 'date'"
      type="date"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="inputValue($event.target.value)"
    >
    <textarea
      v-else
      type="text"
      :value="value"
      class="form-control"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :class="{ 'is-invalid input-invalid': !isValid }"
      rows="1"
      @input="inputValue($event.target.value)"
    ></textarea>
      <div
        v-if="value === '' && isValid"
        class="form-text text-muted"
      >
        Blank values revert to the clients default value.
      </div>
  </div>
</template>

<script>
import isValidConfigValue from './isValidConfigValue';

export default {
  name: 'ConfigValueField',
  props: {
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: [String, Number, Boolean],
    },
  },
  computed: {
    isValid () {
      return isValidConfigValue(this.type, this.value);
    },
  },
  methods: {
    inputValue (value) {
      this.$emit('input', value);
    },
    // <select> values are always strings
    parseBoolean (value) {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return null;
    },
  },
};
</script>
