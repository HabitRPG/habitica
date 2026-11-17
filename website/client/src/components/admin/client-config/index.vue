<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="config-content">
      <ConfigOptions
        :client-configs="clientConfigs"
        :segments="segments"
        @changed="loadConfigs"
      />
      <Segments
        :segments="segments"
        @changed="loadSegments"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.config-content {
  flex: 0 0 100%;
  max-width: 1800px;
}
</style>

<script>
import { mapState } from '@/libs/store';

import Segments from './segmentsTable.vue';
import ConfigOptions from './configOptionsTable.vue';
import menuIcon from '@/assets/svg/menu.svg?raw';
import checkIcon from '@/assets/svg/check.svg?raw';
import closeIcon from '@/assets/svg/close.svg?raw';
import editIcon from '@/assets/svg/edit.svg?raw';
import copyIcon from '@/assets/svg/copy.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';

export default {
  components: {
    Segments,
    ConfigOptions,
  },
  data () {
    return {
      clientConfigs: [],
      segments: [],
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
    this.loadSegments();
  },
  methods: {
    async loadConfigs () {
      let configs = await this.$store.dispatch('clientConfig:getClientConfigs');
      configs = configs.sort((a, b) => (a.group || '').localeCompare(b.group || ''));
      let lastGroupName = null;
      const groupedConfigs = [];
      for (const config of configs) {
        if (config.group !== lastGroupName) {
          if (config.group) {
            groupedConfigs.push({ isGroupHeader: true, name: config.group });
          }
          lastGroupName = config.group;
        }
        groupedConfigs.push(config);
      }
      this.clientConfigs = groupedConfigs;
    },
    async loadSegments () {
      this.segments = await this.$store.dispatch('clientConfig:getClientConfigSegments');
    },
  },
};
</script>
