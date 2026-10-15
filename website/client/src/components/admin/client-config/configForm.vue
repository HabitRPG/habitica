<template>
  <b-modal
    size="lg"
    :visible="true"
    title="Edit Config"
    :ok-disabled="!canSave()"
    @ok="saveConfig"
    @hide="$emit('hide')"
  >
    <h3>General Information</h3>
    <div class="row">
      <div class="form-group col">
        <label class="form-label">Name</label>
        <input
          v-model="editedConfig.name"
          class="form-control"
          type="text"
        >
      </div>
      <div class="form-group col">
        <label class="form-label">Group</label>
        <input
          v-model="editedConfig.group"
          class="form-control"
          type="text"
        >
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input
        v-model="editedConfig.description"
        class="form-control"
        type="text"
      >
    </div>
    <hr>
    <div class="row">
      <div class="form-group col">
        <label class="form-label">Key</label>
        <input
          v-model="editedConfig.key"
          class="form-control"
          type="text"
          :class="{ 'is-invalid input-invalid': !isKeyValid }"
          @input="validateKey()"
        >
        <div
          v-if="!isKeyValid"
          class="invalid-feedback"
        >
          Keys can only contain letters, numbers, and underscores.
        </div>
      </div>
      <div class="form-group col">
        <label class="form-label">Type</label>
        <select
          v-model="editedConfig.type"
          class="form-control"
        >
          <option value="number">
            💯 Number
          </option>
          <option value="text">
            🔤 Text
          </option>
          <option value="boolean">
            ✅ Boolean
          </option>
          <option value="json">
            🗄️ JSON
          </option>
        </select>
      </div>
      <div class="form-group col align-bottom">
        <div class="custom-control custom-switch enable-switch">
          <input
            id="configEnabled"
            v-model="editedConfig.enabled"
            class="custom-control-input"
            type="checkbox"
          >
          <label
            class="custom-control-label"
            for="configEnabled"
          >
            Enabled
          </label>
        </div>
      </div>
      <div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Default Value</label>
      <value-field
        v-model="editedConfig.defaultValue"
        :type="editedConfig.type"
      />
    </div>
    <hr>
    <div
      v-for="(value, index) in editedConfig.values"
      :key="index"
      class="row"
    >
      <div class="form-group col-auto">
        <label class="form-label">Platform</label>
        <select
          v-model="value.platform"
          class="custom-select"
        >
          <option value="web">
            Web
          </option>
          <option value="ios">
            iOS
          </option>
          <option value="android">
            Android
          </option>
          <option value="mobile">
            Mobile
          </option>
        </select>
      </div>
      <div class="form-group col">
        <label class="form-label">Value</label>
        <value-field
          v-model="value.value"
          :type="editedConfig.type"
        />
      </div>
      <div class="col-auto align-middle">
        <span
          class="cursor-pointer delete-button"
          @click="editedConfig.values.splice(index, 1)"
        >
          <div
            v-once
            class="svg-icon icon-16"
            v-html="icons.destroy"
          >
          </div>
        </span>
      </div>
    </div>

    <button
      class="btn btn-secondary"
      @click="addValue"
    >
      Add Value
    </button>
  </b-modal>
</template>

<style scoped lang="scss">
  @import '@/assets/scss/colors.scss';

.delete-button {
  display: inline-flex;
  margin-top: 38px;

  &:hover {
    cursor: pointer;
    color: $maroon-50;
  }
}

.enable-switch {
  margin-top: 32px;
}
</style>

<script>
import valueField from './configValueField.vue';
import deleteIcon from '@/assets/svg/delete.svg?raw';

export default {
  name: 'ConfigForm',
  components: {
    valueField,
  },
  props: {
    isNew: {
      type: Boolean,
      default: false,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      isKeyValid: true,
      editedConfig: {
        name: '',
        key: '',
        enabled: true,
        description: '',
        group: '',
        type: 'text',
        defaultValue: '',
        values: [],
      },
      icons: Object.freeze({
        destroy: deleteIcon,
      }),
    };
  },
  mounted () {
    this.editedConfig = { ...this.config };
  },
  methods: {
    validateKey () {
      this.isKeyValid = this.editedConfig.key.length === 0 || /^[a-zA-Z0-9_]+$/.test(this.editedConfig.key);
    },
    canSave () {
      return this.isKeyValid && this.editedConfig.key.length > 0;
    },
    addValue () {
      this.editedConfig.values.push({
        platform: '',
        value: '',
      });
    },
    saveConfig () {
      if (!this.canSave()) {
        return;
      }
      this.editedConfig.values = this.editedConfig.values.filter(v => v.platform && v.value);
      this.$emit('save', this.editedConfig);
    },
  },
};
</script>
