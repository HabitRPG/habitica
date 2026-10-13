<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="config-content">
      <h1>
        Client Configs
        <button class="btn btn-primary float-right" @click="showCreateForm = true">
          Create
        </button>
      </h1>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>key</th>
            <th>Description</th>
            <th class="values-col">Values</th>
            <th>Enabled</th>
            <th class="btncol"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="config in clientConfigs" :key="config._id">
            <ConfigForm v-if="config._id === editedConfigId" :config="config" @save="saveConfig"
              @hide="editedConfigId = null" />
            <td>{{ getTypeIcon(config.type) }} {{ config.name }}</td>
            <td>{{ config.key }}</td>
            <td>{{ config.description }}</td>
            <td class="values-col"><ValuesDisplay :default-value="config.defaultValue" :values="config.values" /></td>
            <td>{{ config.enabled ? "Yes" : "No" }}</td>
            <td class="btn-cell">
              <button class="edit-btn btn btn-flat" @click="editConfig(config._id)">
                <span v-once class="svg-icon icon-16 color" v-html="icons.editIcon"></span>
              </button>
              <b-dropdown right="right" variant="flat" toggle-class="with-icon"
                class="row-menu no-min-width" :no-caret="true">
                <template #button-content>
                  <span v-once class="svg-icon inline menuIcon color" v-html="icons.menuIcon">
                  </span>
                </template>
                <b-dropdown-item class="selectListItem" @click="duplicateConfig(config._id)">
                  <span class="with-icon">
                    <span v-once class="svg-icon icon-16 color" v-html="icons.editIcon"></span>
                    <span v-once>
                      Duplicate
                    </span>
                  </span>
                </b-dropdown-item>
                <b-dropdown-item class="selectListItem custom-hover--red" @click="deleteConfig(config._id)">
                  <span class="with-icon">
                    <span v-once class="svg-icon icon-16 color" v-html="icons.deleteIcon"></span>
                    <span v-once>
                      {{ $t('delete') }}
                    </span>
                  </span>
                </b-dropdown-item>
              </b-dropdown>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ConfigForm v-if="showCreateForm" :is-new="true" :config="newClientConfig" @save="createConfig"
      @hide="showCreateForm = false" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

  .config-content {
    flex: 0 0 100%;
    max-width: 1800px;
  }

.btncol {
  width: 75px;
}

.values-col {
  min-width: 200px;
  max-width: 400px;
  overflow: hidden;
}

td {
  font-size: 1rem;
  vertical-align: middle;
}

.edit-btn {
  color: $gray-200;
  display: inline-block;
  padding: 0.4rem;

  &:hover {
    color: $purple-300;
  }
}

.info-icon {
  font-size: 0.8rem;
  color: $purple-400;
  cursor: pointer;
  margin-left: 0.5rem;
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
import { mapState } from '@/libs/store';

import editIcon from '@/assets/svg/edit.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import ConfigForm from './configForm.vue';
import ValuesDisplay from './valuesDisplay.vue';
import menuIcon from '@/assets/svg/menu.svg?raw';

export default {
  components: {
    ConfigForm,
    ValuesDisplay,
  },
  data() {
    return {
      showCreateForm: false,
      newClientConfig: {
        name: '',
        key: '',
        enabled: true,
        description: '',
        type: 'text',
        defaultValue: '',
        values: [],
      },
      clientConfigs: [],
      editedConfigId: null,
      icons: Object.freeze({
        editIcon,
        deleteIcon,
        menuIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted() {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('siteBlockers'),
    });
    this.loadConfigs();
  },
  methods: {
    async loadConfigs() {
      this.clientConfigs = await this.$store.dispatch('clientConfig:getClientConfigs');
    },
    editConfig(id) {
      this.editedConfigId = id;
    },
    duplicateConfig(id) {
      const configToDuplicate = this.clientConfigs.find(config => config._id === id);
      if (configToDuplicate) {
        this.newClientConfig = { ...configToDuplicate, name: `${configToDuplicate.name} (Copy)` };
        this.showCreateForm = true;
      }
    },
    async saveConfig(clientConfig) {
      await this.$store.dispatch('clientConfig:updateClientConfig', { clientConfig });
      this.editedConfigId = null;
      this.loadConfigs();
    },
    async deleteConfig(clientConfigId) {
      if (!window.confirm('Are you sure you want to delete this config option?')) {
        return;
      }
      await this.$store.dispatch('clientConfig:deleteClientConfig', { clientConfigId });
      this.loadConfigs();
    },
    async createConfig(clientConfig) {
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
      this.loadConfigs();
    },

    getTypeIcon(type) {
      switch (type) {
        case 'number':
          return '🔢';
        case 'text':
          return '🔤';
        case 'boolean':
          return '✅';
        case 'json':
          return '#️⃣';
        default:
          return type;
      }
    },
  },
};
</script>
