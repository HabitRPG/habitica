<template>
  <b-modal
    size="xl"
    :visible="true"
    title="Edit Config"
    @hide="$emit('hide')"
  >
    <h3>Admin Information</h3>
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
    <h3>App Configuration</h3>
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
          Keys can only contain letters and numbers.
        </div>
      </div>
      <div class="form-group col">
        <label class="form-label">Type</label>
        <select
          v-model="editedConfig.type"
          class="form-control"
        >
          <option value="number">
            Number
          </option>
          <option value="text">
            Text
          </option>
          <option value="boolean">
            Boolean
          </option>
          <option value="json">
            JSON
          </option>
          <option value="email">
            Email
          </option>
          <option value="url">
            URL
          </option>
          <option value="date">
            Date
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
      :key="value.rowKey"
      class="row"
    >
      <div class="form-group col-auto">
        <label class="form-label">Platform</label>
        <select
          v-model="value.platform"
          class="custom-select"
        >
          <option value="">
            All
          </option>
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
      <div class="form-group col-auto">
        <label class="form-label">Segment</label>
        <select
          v-model="value.segment"
          class="custom-select"
        >
          <option value="">
            All users
          </option>
          <option
            v-for="segment in segments"
            :key="segment._id"
            :value="segment._id"
          >
            {{ segment.name }}
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
      <div class="col-auto col-buttons">
        <button
          v-if="editedConfig.values.length > 1"
          class="btn btn-flat btn-primary"
          :disabled="index == 0"
          @click="moveValueUp(index)"
        >
          <div
            v-once
            class="svg-icon icon-16 color-stroke mt-2"
            v-html="icons.arrowup"
          ></div>
        </button>
        <button
          v-if="editedConfig.values.length > 1"
          class="btn btn-flat btn-primary"
          :disabled="index >= editedConfig.values.length - 1"
          @click="moveValueDown(index)"
        >
          <div
            v-once
            class="svg-icon icon-16 color-stroke mt-2"
            v-html="icons.arrowdown"
          ></div>
        </button>
        <button
          class="btn btn-flat btn-danger"
          @click="editedConfig.values.splice(index, 1)"
        >
          <div
            v-once
            class="svg-icon icon-16"
            v-html="icons.destroy"
          >
          </div>
        </button>
      </div>
    </div>

    <p
      v-if="editedConfig.values.length > 0"
      class="text-muted small"
    >
      Segment values take precedence over platform-only values,
      and specific platforms over Mobile. Otherwise the first matching value wins.
    </p>
    <button
      class="btn btn-secondary"
      @click="addValue"
    >
      Add Value
    </button>

    <template #modal-footer>
      <p v-if="formError" class="text-danger">{{ formError }}</p>
      <button
        class="btn btn-secondary"
        @click="$emit('hide')"
      >
        {{ $t('cancel') }}
      </button>
      <button
        v-if="!isSaving"
        class="btn btn-primary"
        :disabled="!canSave()"
        @click="saveConfig"
      >
        {{ isNew ? $t('create') : $t('save') }}
      </button>
      <loading-spinner
        v-else
        class="mx-4"
        :dark-color="true"
      />
    </template>
  </b-modal>
</template>

<style scoped lang="scss">
@import '@/assets/scss/colors.scss';

.col-buttons {
  margin-top: 34px;
}

.enable-switch {
  margin-top: 32px;
}
</style>

<script>
import valueField from './configValueField.vue';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import arrowUpIcon from '@/assets/svg/up.svg?raw';
import arrowDownIcon from '@/assets/svg/down.svg?raw';
import LoadingSpinner from '../../ui/loadingSpinner';
import isValidConfigValue from './isValidConfigValue';

let nextRowKey = 0;

export default {
  name: 'ConfigForm',
  components: {
    valueField,
    LoadingSpinner,
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
    segments: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      isKeyValid: true,
      isSaving: false,
      formError: null,
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
        arrowup: arrowUpIcon,
        arrowdown: arrowDownIcon,
      }),
    };
  },
  mounted () {
    this.editedConfig = {
      ...this.config,
      values: (this.config.values || []).map(v => ({
        platform: '', segment: '', ...v, rowKey: nextRowKey++, // eslint-disable-line no-plusplus
      })),
    };
  },
  methods: {
    moveValueUp (index) {
      if (index > 0) this.swapValues(index - 1);
    },
    moveValueDown (index) {
      if (index < this.editedConfig.values.length - 1) this.swapValues(index);
    },
    swapValues (index) {
      const [moved] = this.editedConfig.values.splice(index, 1);
      this.editedConfig.values.splice(index + 1, 0, moved);
    },
    validateKey () {
      this.isKeyValid = this.editedConfig.key.length === 0 || /^[a-zA-Z0-9]+$/.test(this.editedConfig.key);
    },
    canSave () {
      const { type, defaultValue, values } = this.editedConfig;
      return this.isKeyValid && this.editedConfig.key.length > 0
        && isValidConfigValue(type, defaultValue)
        && values.every(v => isValidConfigValue(type, v.value));
    },
    addValue () {
      this.editedConfig.values.push({
        rowKey: nextRowKey++, // eslint-disable-line no-plusplus
        platform: '',
        segment: '',
        value: '',
      });
    },
    async saveConfig (modalEvent) {
      if (!this.canSave()) {
        return;
      }
      modalEvent.preventDefault();
      this.isSaving = true;
      this.formError = null;
      this.editedConfig.values = this.editedConfig.values
        .filter(v => (v.platform || v.segment) && v.value !== '' && v.value !== undefined);

      try {
        if (this.isNew) {
          await this.$store.dispatch('clientConfig:createClientConfig', { clientConfig: this.editedConfig });
        } else {
          await this.$store.dispatch('clientConfig:updateClientConfig', { clientConfig: this.editedConfig });
        }

        this.$emit('saved');
      } catch (error) {
        this.formError = (error.response && error.response.data && error.response.data.message)
          || error.message || 'An error occurred while saving the config.';
      }
      this.isSaving = false;
    },
  },
};
</script>
