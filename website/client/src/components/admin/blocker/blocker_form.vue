<template>
  <div style="display: contents">
    <td><select class="form-control" v-model="blocker.type">
      <option value="ipaddress">IP-Address</option>
      <option value="client">Client Identifier</option>
      <option value="email">E-Mail</option>
      </select>
    </td>
    <td><select class="form-control" v-model="blocker.area">
      <option value="full">Full</option>
    </select></td>
    <td><input class="form-control" v-model="blocker.value" autocorrect="off" autocapitalize="off"></td>
    <td><input class="form-control" v-model="blocker.reason"></td>
    <td></td>
    <td>
      <button class="btn btn-primary mr-2" @click="$emit('save', blocker)">
        <span>Save</span>
      </button>
      <button class="btn btn-danger" @click="$emit('cancel')">
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
