<template>
  <div style="display: contents">
    <td>
      <select
        v-model="blocker.type"
        @change="onTypeChanged"
        class="form-control"
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
        @input="validateValue"
        class="form-control"
        autocorrect="off"
        autocapitalize="off"
      >
    </td>
    <td>
      <input
        v-model="blocker.reason"
        class="form-control"
      >
    </td>
    <td colspan="3" class="text-right">
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

<script>
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
    onTypeChanged: function () {
      if (this.blocker.type === 'email') {
        this.blocker.area = 'full';
      }
      this.validateValue();
    },
    validateValue: function () {
      if (this.blocker.type === 'ipaddress') {
        this.validateValueAsIpAddress();
      } else if (this.blocker.type === 'client') {
        this.validateValueAsClient();
      } else if (this.blocker.type === 'email') {
        this.validateValueAsEmail();
      }
    },
    validateValueAsEmail: function () {
      const emailRegex = /^([a-zA-Z0-9._%+-]*)@(?:[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?$/;
      this.isValid = emailRegex.test(this.blocker.value) && this.blocker.value.length > 3;
    },
    validateValueAsIpAddress: function () {
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      this.isValid = ipRegex.test(this.blocker.value);
    },
    validateValueAsClient: function () {
      this.isValid = this.blocker.value.length > 0;
    },
  },
};
</script>
