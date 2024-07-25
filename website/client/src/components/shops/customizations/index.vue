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
          <div class="featured-label">
            <span class="rectangle"></span><span
              v-once
              class="text"
            >{{ $t('customizationsNPC') }}</span><span class="rectangle"></span>
          </div>
        </div>
      </div>
      <div class="p-4">
        <h1
          v-once
        >
          {{ $t('customizations') }}
        </h1>
        <div
          v-for="category in categories"
          :key="category.identifier"
        >
          <h2 class="mb-3 mt-4">
            {{ category.text }}
          </h2>
          <item-rows
            :items="customizationsItems({category, searchBy: searchTextThrottled})"
            :type="category.identifier"
            :fold-button="category.identifier === 'background'"
            :item-width="94"
            :item-margin="24"
            :max-items-per-row="8"
            :no-items-label="emptyStateString(category.identifier)"
            @emptyClick="emptyClick(category.identifier, $event)"
          >
            <template
              slot="item"
              slot-scope="ctx"
            >
              <shop-item
                :key="ctx.item.path"
                :item="ctx.item"
                :price="ctx.item.value"
                :price-type="ctx.item.currency"
                :empty-item="false"
                :show-popover="Boolean(ctx.item.text)"
                @click="selectItem(ctx.item)"
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
  @import '~@/assets/scss/shops.scss';

  h1 {
    line-height: 32px;
    color: $purple-200;
  }

  .background, .npc {
    height: 216px;
  }

  .featured-label {
    margin-left: 90px;
    margin-top: 200px;
  }

  .npc {
    background-repeat: no-repeat;
  }
</style>

<script>
import find from 'lodash/find';
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
      unfilteredCategories: [],
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
      const currentEvent = find(this.currentEventList, event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/customizations_background.png)',
          npc: 'url(/static/npc/normal/customizations_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${currentEvent.season}/customizations_background.png)`,
        npc: `url(/static/npc/${currentEvent.season}/customizations_npc.png)`,
      };
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
    this.updateShop();
    this.$root.$on('buyModal::boughtItem', () => {
      this.updateShop();
    });
  },
  methods: {
    customizationsItems (options = {}) {
      const { category, searchBy } = options;
      return category.items.filter(item => !searchBy
        || item.text.toLowerCase().includes(searchBy));
    },
    emptyClick (identifier, event) {
      if (event.target.tagName !== 'A') return;
      this.$store.state.avatarEditorOptions.editingUser = true;
      switch (identifier) {
        case 'animalEars':
          this.$store.state.avatarEditorOptions.startingPage = 'extra';
          this.$store.state.avatarEditorOptions.subpage = 'ears';
          break;
        case 'animalTails':
          this.$store.state.avatarEditorOptions.startingPage = 'extra';
          this.$store.state.avatarEditorOptions.subpage = 'tails';
          break;
        case 'backgrounds':
          this.$store.state.avatarEditorOptions.startingPage = 'background';
          this.$store.state.avatarEditorOptions.subpage = '2024';
          break;
        case 'facialHair':
          this.$store.state.avatarEditorOptions.startingPage = 'hair';
          this.$store.state.avatarEditorOptions.subpage = 'beard';
          break;
        case 'color':
          this.$store.state.avatarEditorOptions.startingPage = 'hair';
          this.$store.state.avatarEditorOptions.subpage = 'color';
          break;
        case 'base':
          this.$store.state.avatarEditorOptions.startingPage = 'hair';
          this.$store.state.avatarEditorOptions.subpage = 'style';
          break;
        case 'shirt':
          this.$store.state.avatarEditorOptions.startingPage = 'body';
          this.$store.state.avatarEditorOptions.subpage = 'shirt';
          break;
        case 'skin':
          this.$store.state.avatarEditorOptions.startingPage = 'skin';
          this.$store.state.avatarEditorOptions.subpage = 'color';
          break;
        default:
          throw new Error(`Unknown identifier ${identifier}`);
      }
      this.$root.$emit('bv::show::modal', 'avatar-modal');
    },
    emptyStateString (identifier) {
      const { $t } = this;
      switch (identifier) {
        case 'animalEars':
          return $t('allCustomizationsOwned');
        case 'animalTails':
          return $t('allCustomizationsOwned');
        case 'backgrounds':
          return `${$t('allCustomizationsOwned')} ${$t('checkNextMonth')}`;
        case 'facialHair':
          return $t('allCustomizationsOwned');
        case 'color':
          return `${$t('allCustomizationsOwned')} ${$t('checkNextSeason')}`;
        case 'base':
          return $t('allCustomizationsOwned');
        case 'shirt':
          return $t('allCustomizationsOwned');
        case 'skin':
          return `${$t('allCustomizationsOwned')} ${$t('checkNextSeason')}`;
        default:
          return `Unknown identifier ${identifier}`;
      }
    },
    selectItem (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
    updateShop () {
      const shop = shops.getCustomizationsShop(this.user);

      shop.categories.forEach(category => {
        // do not reset the viewOptions if already set once
        if (typeof this.viewOptions[category.identifier] === 'undefined') {
          this.$set(this.viewOptions, category.identifier, {
            selected: false,
          });
        }
      });

      this.unfilteredCategories = shop.categories;
    },
  },
};
</script>
