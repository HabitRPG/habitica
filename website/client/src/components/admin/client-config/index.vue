<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="config-content">
      <h1>
        Client Configs
        <button
          class="btn btn-primary float-right"
          @click="showCreateForm = true"
        >
          Create
        </button>
      </h1>
      <table class="table table-bordered bg-white">
        <thead>
          <tr>
            <th class="name-col">
              Name
            </th>
            <th >Type</th>
            <th class="values-col">
              Values
            </th>
            <th>
              Enabled
            </th>
            <th class="btncol"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="config in clientConfigs"
            :key="config._id"
            :class="{ 'disabled-row': !config.enabled }"
          >
            <ConfigForm
              v-if="config._id === editedConfigId"
              :config="config"
              @save="saveConfig"
              @hide="editedConfigId = null"
            />
            <td class="name-col">
              {{ config.name }}
              <template v-if="config.description">
                <span
                  :id="`description_tooltip_${config._id}`"
                  class="info-icon"
                >?</span>
                <b-tooltip
                  :target="`description_tooltip_${config._id}`"
                >
                  {{ config.description }}
                </b-tooltip>
              </template>
            </td>
            <td class="type-col">
              <div
                class="d-inline badge badge-pill badge-default mr-1"
                :class="'badge-' + config.type"
              >
                {{ getTypeText(config.type) }}
              </div>
            </td>
            <td class="values-col">
              <ValuesDisplay
                :default-value="config.defaultValue"
                :values="config.values"
              />
            </td>
            <td class="enabled-col">
              <span
                v-if="config.enabled"
                class="svg-icon icon-16 color enabled-icon"
                v-html="icons.checkIcon"
              ></span>
              <span
                v-else
                class="svg-icon icon-16 color disabled-icon"
                v-html="icons.closeIcon"
              ></span>
            </td>
            <td class="btn-cell">
              <button
                class="edit-btn btn btn-flat"
                @click="editConfig(config._id)"
              >
                <span
                  v-once
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
                    v-once
                    class="svg-icon inline menuIcon color"
                    v-html="icons.menuIcon"
                  >
                  </span>
                </template>
                <b-dropdown-item
                  class="selectListItem"
                  @click="duplicateConfig(config._id)"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.copyIcon"
                    ></span>
                    <span v-once>
                      Duplicate
                    </span>
                  </span>
                </b-dropdown-item>
                <b-dropdown-item
                  class="selectListItem custom-hover--red"
                  @click="deleteConfig(config._id)"
                >
                  <span class="with-icon">
                    <span
                      v-once
                      class="svg-icon icon-16 color"
                      v-html="icons.deleteIcon"
                    ></span>
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
    <ConfigForm
      v-if="showCreateForm"
      :is-new="true"
      :config="newClientConfig"
      @save="createConfig"
      @hide="showCreateForm = false"
    />
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
  overflow: hidden;
}

.enabled-col {
  text-align: center;

  .svg-icon {
    margin: 0 auto;
  }
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

.name-col {
  white-space: nowrap;
}

.type-col {
  text-align: center;
}

.disabled-row td {
  color: $gray-200;
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

.badge-email {
    background-color: $blue-100;
    color: $blue-1
}

.badge-url {
    background-color: $green-100;
    color: $green-1;
}

.badge-number {
    background-color: $yellow-100;
    color: $yellow-1;
}

.badge-text {
    background-color: $purple-300;
    color: $purple-600;
}

.badge-boolean {
    background-color: $orange-100;
    color: $orange-1;
}

.badge-json {
    background-color: $red-100;
    color: $red-1;
}

.badge-date {
    background-color: $teal-100;
    color: $teal-1;
}

</style>

<script>
import { mapState } from '@/libs/store';

import editIcon from '@/assets/svg/edit.svg?raw';
import copyIcon from '@/assets/svg/copy.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import ConfigForm from './configForm.vue';
import ValuesDisplay from './valuesDisplay.vue';
import menuIcon from '@/assets/svg/menu.svg?raw';
import checkIcon from '@/assets/svg/check.svg?raw';
import closeIcon from '@/assets/svg/close.svg?raw';

export default {
  components: {
    ConfigForm,
    ValuesDisplay,
  },
  data () {
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
        copyIcon,
        checkIcon,
        closeIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('clientConfigs'),
    });
    this.loadConfigs();
  },
  methods: {
    async loadConfigs () {
      this.clientConfigs = await this.$store.dispatch('clientConfig:getClientConfigs');
    },
    editConfig (id) {
      this.editedConfigId = id;
    },
    duplicateConfig (id) {
      const configToDuplicate = this.clientConfigs.find(config => config._id === id);
      if (configToDuplicate) {
        this.newClientConfig = { ...configToDuplicate, name: `${configToDuplicate.name} (Copy)` };
        this.showCreateForm = true;
      }
    },
    async saveConfig (clientConfig) {
      await this.$store.dispatch('clientConfig:updateClientConfig', { clientConfig });
      this.editedConfigId = null;
      this.loadConfigs();
    },
    async deleteConfig (clientConfigId) {
      if (!window.confirm('Are you sure you want to delete this config option?')) {
        return;
      }
      await this.$store.dispatch('clientConfig:deleteClientConfig', { clientConfigId });
      this.loadConfigs();
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
      this.loadConfigs();
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
  },
};
</script>
