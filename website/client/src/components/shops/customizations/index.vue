<template>
  <div class="row market">
    <div class="standard-sidebar">
      <filter-sidebar>
        <div
          slot="search"
          class="form-group"
        >
          <input
            v-model="searchText"
            class="form-control input-search"
            type="text"
            :placeholder="$t('search')"
          >
        </div>
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
          <item-rows
            :items="customizationsItems({category, searchBy: searchTextThrottled})"
            :type="category.identifier"
            :item-width="94"
            :item-margin="24"
            :max-items-per-row="8"
          >
            <template
              slot="item"
              slot-scope="ctx"
            >
              <shop-item
                :item="ctx.item"
                :key="ctx.item.key"
                :price="ctx.item.value"
                :price-type="ctx.item.currency"
                :empty-item="false"
                :show-popover="Boolean(ctx.item.text)"
              />
            </template>
          </item-rows>
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

  .item-rows {
    max-width: 920px;

    .items > div:nth-of-type(8n) {
      margin-right: 0px;
    }
  }

  .npc {
    background-repeat: no-repeat;
  }
</style>

<script>
import shops from '@/../../common/script/libs/shops';
import throttle from 'lodash/throttle';
import { mapState } from '@/libs/store';

import Checkbox from '@/components/ui/checkbox';
import FilterGroup from '@/components/ui/filterGroup';
import FilterSidebar from '@/components/ui/filterSidebar';
import ItemRows from '@/components/ui/itemRows';
import ShopItem from '../shopItem';

export default {
  components: {
    Checkbox,
    FilterGroup,
    FilterSidebar,
    ItemRows,
    ShopItem,
  },
  data () {
    return {
      searchText: null,
      searchTextThrottled: null,
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
      const currentEvent = this.currentEventList?.find(event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/market_background.png)',
          npc: 'url(/static/npc/normal/market_banner_npc.png)',
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
  watch: {
    // TODO mixin?
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('customizations'),
      section: this.$t('shops'),
    });
  },
  methods: {
    customizationsItems (options = {}) {
      const { category, searchBy } = options;
      return category.items.filter(item => !searchBy
        || item.text.toLowerCase().includes(searchBy));
    },
  },
};
</script>
