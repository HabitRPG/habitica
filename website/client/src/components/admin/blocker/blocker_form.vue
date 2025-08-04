<template>
  <div style="display: contents">
    <td>
      <select
        v-model="blocker.type"
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
    <td></td>
    <td></td>
    <td>
      <button
        class="btn btn-primary mr-2"
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
    return {};
  },
  methods: {
    // Add methods if needed
  },
};
</script>
