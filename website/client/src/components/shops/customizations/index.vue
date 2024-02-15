<template>
  <div class="row market">
    <div class="standard-sidebar">
      <filter-sidebar>
        <filter-group>
          <checkbox
            v-for="category in unfilteredCategories"
            :id="`category-${category.identifier}`"
            :key="category.identifier"
            :checked.sync="viewOptions[category.identifier].selected"
            :text="category.text"
          />
        </filter-group>
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
      <div class="p-4">
        <h1
          v-once
          class="mb-4"
        >
          {{ $t('customizations') }}
        </h1>
        <div
          v-for="category in categories"
          :key="category.identifier"
        >
          <h2 class="mb-3">
            {{ category.text }}
          </h2>
          <div
            v-for="item in category.items"
            :key="item.key"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h1 {
    color: $purple-200;
  }

  .background, .npc {
    height: 216px;
  }

  .npc {
    background-repeat: no-repeat;
  }
</style>

<script>
import shops from '@/../../common/script/libs/shops';
import { mapState } from '@/libs/store';

import Checkbox from '@/components/ui/checkbox';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';

export default {
  components: {
    Checkbox,
    FilterGroup,
    FilterSidebar,
  },
  data () {
    return {
      viewOptions: {},
    };
  },
  computed: {
    ...mapState({
      // content: 'content',
      user: 'user.data',
      currentEventList: 'worldState.data.currentEventList',
    }),
    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
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
    shop () {
      return shops.getCustomizationsShop(this.user);
    },
    unfilteredCategories () {
      const apiCategories = this.shop.categories;

      apiCategories.forEach(category => {
        // do not reset the viewOptions if already set once
        if (typeof this.viewOptions[category.identifier] === 'undefined') {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
          });
        }
      });

      return apiCategories;
    },
    categories () {
      const { unfilteredCategories } = this;

      return unfilteredCategories.filter(category => !this.anyFilterSelected
        || this.viewOptions[category.identifier].selected);
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
