<template>
  <div style="display: contents">
    <td>
      <select
        v-model="blocker.type"
        class="form-control"
        @change="onTypeChanged"
      >
        <option value="ipaddress">
          IP-Address
        </option>
        <option value="client">
          Client Identifier
        </option>
        <option value="email">
          E-Mail
        </option>
      </select>
    </td>
    <td>
      <select
        v-model="blocker.area"
        class="form-control"
      >
        <option value="full">
          Full
        </option>
      </select>
    </td>
    <td>
      <input
        v-model="blocker.value"
        class="form-control"
        autocorrect="off"
        autocapitalize="off"
        :class="{ 'is-invalid input-invalid': !isValid }"
        @input="validateValue"
      >
    </td>
    <td>
      <input
        v-model="blocker.reason"
        class="form-control"
      >
    </td>
    <td
      colspan="3"
      class="text-right"
    >
      <button
        class="btn btn-primary mr-2"
        :disabled="!isValid"
        :class="{ disabled: !isValid }"
        @click="$emit('save', blocker)"
      >
        <span>Save</span>
      </button>
      <button
        class="btn btn-danger"
        @click="$emit('cancel')"
      >
        <span>Cancel</span>
      </button>
    </td>
  </div>
</template>

<style lang="scss" scoped>
 .btn-primary.disabled {
    background: #4F2A93;
    color: white;
    cursor: not-allowed;
    opacity: 0.5;
 }
</style>

<script>
import isIP from 'validator/es/lib/isIP';

export default {
  name: 'BlockerForm',
  props: {
    isNew: {
      type: Boolean,
      default: false,
    },
    blocker: {
      type: Object,
      default: () => ({
        type: '',
        area: '',
        value: '',
        reason: '',
      }),
    },
  },
  data () {
    return {
      isValid: false,
    };
  },
  mounted () {
    this.validateValue();
  },
  methods: {
    onTypeChanged () {
      if (this.blocker.type === 'email') {
        this.blocker.area = 'full';
      }
      this.validateValue();
    },
    validateValue () {
      if (this.blocker.type === 'ipaddress') {
        this.validateValueAsIpAddress();
      } else if (this.blocker.type === 'client') {
        this.validateValueAsClient();
      } else if (this.blocker.type === 'email') {
        this.validateValueAsEmail();
      }
    },
    validateValueAsEmail () {
      const emailRegex = /^([a-zA-Z0-9._%+-]*)@(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/;
      this.isValid = emailRegex.test(this.blocker.value) && this.blocker.value.length > 3;
    },
    validateValueAsIpAddress () {
      this.isValid = isIP(this.blocker.value);
    },
    validateValueAsClient () {
      this.isValid = this.blocker.value.length > 0;
    },
  },
};
</script>
