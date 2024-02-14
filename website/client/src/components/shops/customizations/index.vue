<template>
  <div class="row market">
    <div class="standard-sidebar">
      <filter-sidebar>
        <filter-group />
      </filter-sidebar>
    </div>
    <div class="standard-page p-0">
      <div
        class="background"
        :style="{'background-image': imageURLs.background}"
      >
        <div
          class="npc"
          :style="{'background-image': imageURLs.npc}"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .background, .npc {
    height: 216px;
  }

  .npc {
    background-repeat: no-repeat;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';

export default {
  components: {
    FilterGroup,
    FilterSidebar,
  },
  computed: {
    ...mapState({
      // content: 'content',
      // user: 'user.data',
      currentEventList: 'worldState.data.currentEventList',
    }),
    imageURLs () {
      const currentEvent = this.currentEventList.find(event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/market_background.png)',
          npc: 'url(/static/npc/normal/market_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${currentEvent.season}/market_background.png)`,
        npc: `url(/static/npc/${currentEvent.season}/market_banner_npc.png)`,
      };
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('customizations'),
      section: this.$t('shops'),
    });
  },
};
</script>
