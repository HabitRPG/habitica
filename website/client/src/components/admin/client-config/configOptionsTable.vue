<template>
  <div>
    <h2>
      Config Options
      <button
        class="btn btn-primary float-right"
        @click="showCreateForm = true"
      >
        Create
      </button>
    </h2>
    <table class="table table-bordered bg-white">
      <thead>
        <tr>
          <th class="name-col">
            Name
          </th>
          <th>Type</th>
          <th>
            Enabled
          </th>
          <th class="values-col">
            Values
          </th>
          <th class="btncol"></th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="entry in clientConfigs"
        >
          <tr
            v-if="entry.key"
            :key="entry._id"
            :class="{ 'disabled-row': !entry.enabled }"
          >
            <ConfigForm
              v-if="entry._id === editedConfigId"
              :config="entry"
              :segments="segments"
              @save="saveConfig"
              @hide="editedConfigId = null"
            />
            <td class="text-nowrap">
              {{ entry.name }}
              <template v-if="entry.description">
                <span
                  :id="`description_tooltip_${entry._id}`"
                  class="info-icon"
                >?</span>
                <b-tooltip :target="`description_tooltip_${entry._id}`">
                  {{ entry.description }}
                </b-tooltip>
              </template>
            </td>
            <td class="text-center">
              <div
                class="d-inline badge badge-pill"
                :class="getTypeColor(entry.type)"
              >
                {{ getTypeText(entry.type) }}
              </div>
            </td>
            <td class="text-center">
              <span
                v-if="entry.enabled"
                class="svg-icon icon-16 color enabled-icon"
                v-html="icons.checkIcon"
              ></span>
              <span
                v-else
                class="svg-icon icon-16 color disabled-icon"
                v-html="icons.closeIcon"
              ></span>
            </td>
            <td class="overflow-hidden">
              <ValuesDisplay
                :default-value="entry.defaultValue"
                :values="entry.values"
                :segments="segments"
              />
            </td>
            <td class="btn-cell">
              <button
                class="btn btn-flat btn-secondary"
                @click="editConfig(entry._id)"
              >
                <span
                  class="svg-icon icon-16 color"
                  v-html="icons.editIcon"
                ></span>
              </button>
              <b-dropdown
                right="right"
                variant="flat"
                toggle-class="with-icon"
                class="row-menu no-min-width"
                :no-caret="true"
              >
                <template #button-content>
                  <span
                    class="svg-icon inline menuIcon color"
                    v-html="icons.menuIcon"
                  >
                  </span>
                </template>
                <b-dropdown-item
                  class="selectListItem"
                  @click="duplicateConfig(entry._id)"
                >
                  <span class="with-icon">
                    <span
                      class="svg-icon icon-16 color"
                      v-html="icons.copyIcon"
                    ></span>
                    <span>
                      Duplicate
                    </span>
                  </span>
                </b-dropdown-item>
                <b-dropdown-item
                  class="selectListItem custom-hover--red"
                  @click="deleteConfig(entry._id)"
                >
                  <span class="with-icon">
                    <span
                      class="svg-icon icon-16 color"
                      v-html="icons.deleteIcon"
                    ></span>
                    <span>
                      {{ $t('delete') }}
                    </span>
                  </span>
                </b-dropdown-item>
              </b-dropdown>
            </td>
          </tr>
          <tr
            v-else
            :key="entry.name"
          >
            <td
              colspan="5"
              class="font-weight-bold"
            >
              {{ entry.name }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <ConfigForm
      v-if="showCreateForm"
      :is-new="true"
      :config="newClientConfig"
      :segments="segments"
      @save="createConfig"
      @hide="showCreateForm = false"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.btncol {
  width: 90px;
}

.enabled-icon {
  color: $green-10;
}

.disabled-icon {
  color: $gray-200;
}

td {
  font-size: 1rem;
  vertical-align: middle;
}

.disabled-row td {
  color: $gray-200;
}

.info-icon {
  font-size: 0.8rem;
  color: $purple-400;
  cursor: pointer;
  background-color: $gray-500;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
}

.info-icon:hover {
  background-color: $purple-400;
  color: white;
}

.row-menu {
  // icon-color is the menu icon itself
  --icon-color: #{$gray-100};

  --dropdown-item-hover-icon-color: #{$gray-100};

  &:hover {
    --icon-color: #{$purple-300};
  }
}

.menuIcon {
  width: 4px;
  height: 1rem;
  object-fit: contain;
}

.custom-hover--red {
  --hover-color: #{$maroon-50};
  --hover-background: #{rgba($red-500, 0.25)};
}

.btn-cell {
  padding: 0.4rem;
}
</style>

<script>
import ConfigForm from './configForm.vue';
import ValuesDisplay from './valuesDisplay.vue';
import menuIcon from '@/assets/svg/menu.svg?raw';
import checkIcon from '@/assets/svg/check.svg?raw';
import closeIcon from '@/assets/svg/close.svg?raw';
import editIcon from '@/assets/svg/edit.svg?raw';
import copyIcon from '@/assets/svg/copy.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';

export default {
  components: {
    ConfigForm,
    ValuesDisplay,
  },
  props: {
    clientConfigs: Array,
    segments: Array,
  },
  data () {
    return {
      showCreateForm: false,
      editedConfigId: null,
      newClientConfig: {
        name: '',
        key: '',
        enabled: true,
        description: '',
        type: 'text',
        defaultValue: '',
        values: [],
      },
      icons: Object.freeze({
        editIcon,
        deleteIcon,
        menuIcon,
        copyIcon,
        checkIcon,
        closeIcon,
      }),
    };
  },
  methods: {
    editConfig (id) {
      this.editedConfigId = id;
    },
    duplicateConfig (id) {
      const configToDuplicate = this.clientConfigs.find(config => config._id === id);
      if (configToDuplicate) {
        this.newClientConfig = { ...configToDuplicate,
            name: `${configToDuplicate.name} (Copy)`,
            key: `${configToDuplicate.key}Copy` };
        delete this.newClientConfig._id;
        this.showCreateForm = true;
      }
    },
    async saveConfig (clientConfig) {
      await this.$store.dispatch('clientConfig:updateClientConfig', { clientConfig });
      this.editedConfigId = null;
      this.$emit('changed');
    },
    async deleteConfig (clientConfigId) {
      if (!window.confirm('Are you sure you want to delete this config option?')) {
        return;
      }
      await this.$store.dispatch('clientConfig:deleteClientConfig', { clientConfigId });
      this.$emit('changed');
    },
    async createConfig (clientConfig) {
      await this.$store.dispatch('clientConfig:createClientConfig', { clientConfig });
      this.showCreateForm = false;
      this.newClientConfig = {
        name: '',
        key: '',
        enabled: true,
        description: '',
        type: 'text',
        defaultValue: '',
        values: [],
      };
      this.$emit('changed');
    },

    getTypeText (type) {
      switch (type) {
        case 'number':
          return 'Number';
        case 'text':
          return 'Text';
        case 'boolean':
          return 'Boolean';
        case 'json':
          return 'JSON';
        case 'email':
          return 'Email';
        case 'url':
          return 'URL';
        case 'date':
          return 'Date';
        default:
          return type;
      }
    },

    getTypeColor (type) {
      switch (type) {
        case 'number':
          return 'badge-yellow';
        case 'text':
          return 'badge-purple';
        case 'boolean':
          return 'badge-orange';
        case 'json':
          return 'badge-red';
        case 'email':
          return 'badge-blue';
        case 'url':
          return 'badge-green';
        case 'date':
          return 'badge-teal';
        default:
          return 'badge-default';
      }
    },
  },
};
</script>
