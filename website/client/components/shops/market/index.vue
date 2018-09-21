<template lang="pug">
  page-layout.market
    div(slot="sidebar")
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")
      market-filter(
        :categories="categories",
        :hideLocked.sync="hideLocked",
        :hidePinned.sync="hidePinned",
        :viewOptions="viewOptions"
      )
    div(slot="page")
      featured-items-header(
        :broken="broken",
        :npcName="'Alex'",
        :featuredText="market.featured.text",
        :featuredItems="market.featured.items"
        @featuredItemSelected="featuredItemSelected($event)"
      )

      h1.mb-4.page-header(v-once) {{ $t('market') }}

      equipment-section(
        v-if="viewOptions['equipment'].selected",
        :hidePinned="hidePinned",
        :hideLocked="hideLocked",
        :searchBy="searchTextThrottled"
      )

      layout-section(:title="$t('items')")
        div(slot="filters")
          filter-dropdown(
            :label="$t('sortBy')",
            :initialItem="selectedSortItemsBy",
            :items="sortItemsBy",
            @selected="selectedSortItemsBy = $event"
          )
            span(slot="item", slot-scope="ctx")
              span.text {{ $t(ctx.item.id) }}
      div(
        v-for="category in categories",
        v-if="viewOptions[category.identifier].selected && category.identifier !== 'equipment'"
      )
        h4 {{ category.text }}
          category-row(
            :hidePinned="hidePinned",
            :hideLocked="hideLocked",
            :searchBy="searchTextThrottled",
            :sortBy="selectedSortItemsBy.id",
            :category="category"
          )
          keys-to-kennel(v-if='category.identifier === "special"')
        div.fill-height

      inventoryDrawer(:showEggs="true", :showPotions="true")
        template(slot="item", slot-scope="ctx")
          item(
            :item="ctx.item",
            :itemContentClass="ctx.itemClass",
            popoverPosition="top",
            @click="sellItem(ctx)"
          )
            countBadge(
              slot="itemBadge"
              :show="true",
              :count="ctx.itemCount"
            )
            h4.popover-content-title(slot="popoverContent") {{ ctx.itemName }}

      sellModal
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/variables.scss';

  .fill-height {
    height: 38px; // button + margin + padding
  }


  .icon-48 {
    width: 48px;
    height: 48px;
  }

  .item-wrapper.bordered-item .item {
    width: 112px;
    height: 112px;
  }

  .market {
    .avatar {
      cursor: default;
      margin: 0 auto;
    }


    .featuredItems {
      .background {
        background: url('~assets/images/npc/#{$npc_market_flavor}/market_background.png');

        background-repeat: repeat-x;
      }

      .npc {
        background: url('~assets/images/npc/#{$npc_market_flavor}/market_banner_npc.png');
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 80px;
        }
      }
    }
  }

  .market .gems-left {
    right: -.5em;
    top: -.5em;
  }
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import KeysToKennel from './keysToKennel';
  import EquipmentSection from './equipmentSection';
  import CategoryRow from './categoryRow';
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import ItemRows from 'client/components/ui/itemRows';
  import Avatar from 'client/components/avatar';
  import InventoryDrawer from 'client/components/shared/inventoryDrawer';
  import FeaturedItemsHeader from '../featuredItemsHeader';
  import PageLayout from 'client/components/ui/pageLayout';
  import LayoutSection from 'client/components/ui/layoutSection';
  import FilterDropdown from 'client/components/ui/filterDropdown';
  import MarketFilter from './filter';

  import SellModal from './sellModal.vue';
  import EquipmentAttributesGrid from '../../inventory/equipment/attributesGrid.vue';
  import SelectMembersModal from 'client/components/selectMembersModal.vue';

  import svgPin from 'assets/svg/pin.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgInformation from 'assets/svg/information.svg';

  import getItemInfo from 'common/script/libs/getItemInfo';
  import shops from 'common/script/libs/shops';

  import _filter from 'lodash/filter';
  import _map from 'lodash/map';
  import _throttle from 'lodash/throttle';

  const sortItems = ['AZ', 'sortByNumber'].map(g => ({id: g}));

  import notifications from 'client/mixins/notifications';
  import buyMixin from 'client/mixins/buy';
  import currencyMixin from '../_currencyMixin';
  import inventoryUtils from 'client/mixins/inventoryUtils';
  import pinUtils from 'client/mixins/pinUtils';

export default {
    mixins: [notifications, buyMixin, currencyMixin, inventoryUtils, pinUtils],
    components: {
      ShopItem,
      KeysToKennel,
      Item,
      CountBadge,

      ItemRows,

      SellModal,
      EquipmentAttributesGrid,
      Avatar,

      InventoryDrawer,
      FeaturedItemsHeader,
      PageLayout,
      LayoutSection,
      FilterDropdown,
      EquipmentSection,
      CategoryRow,
      MarketFilter,

      SelectMembersModal,
    },
    watch: {
      searchText: _throttle(function throttleSearch () {
        this.searchTextThrottled = this.searchText.toLowerCase();
      }, 250),
    },
    data () {
      return {
        viewOptions: {},

        searchText: null,
        searchTextThrottled: null,

        icons: Object.freeze({
          pin: svgPin,
          gem: svgGem,
          information: svgInformation,
        }),

        sortItemsBy: sortItems,
        selectedSortItemsBy: sortItems[0],

        hideLocked: false,
        hidePinned: false,

        broken: false,
      };
    },
    async mounted () {
      const worldState = await this.$store.dispatch('worldState:getWorldState');
      this.broken = worldState && worldState.worldBoss && worldState.worldBoss.extra && worldState.worldBoss.extra.worldDmg && worldState.worldBoss.extra.worldDmg.market;
    },
    computed: {
      ...mapState({
        content: 'content',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),
      market () {
        return shops.getMarketShop(this.user);
      },
      categories () {
        if (!this.market) return [];

        let categories = [
          ...this.market.categories,
        ];

        categories.push({
          identifier: 'equipment',
          text: this.$t('equipment'),
        });

        categories.push({
          identifier: 'cards',
          text: this.$t('cards'),
          items: _map(_filter(this.content.cardTypes, (value) => {
            return value.yearRound;
          }), (value) => {
            return {
              ...getItemInfo(this.user, 'card', value),
              showCount: false,
            };
          }),
        });

        let specialItems = [{
          ...getItemInfo(this.user, 'fortify'),
          showCount: false,
        }];

        if (this.user.purchased.plan.customerId) {
          let gemItem = getItemInfo(this.user, 'gem');

          specialItems.push({
            ...gemItem,
            showCount: false,
          });
        }

        if (this.user.flags.rebirthEnabled) {
          let rebirthItem = getItemInfo(this.user, 'rebirth_orb');

          specialItems.push({
            showCount: false,
            ...rebirthItem,
          });
        }

        if (this.user.flags.emptyArmoryEnabled) {
          let armoryKeyItem = getItemInfo(this.user, 'armory_key');

          specialItems.push({
            showCount: false,
            ...armoryKeyItem,
          });
        }

        if (specialItems.length > 0) {
          categories.push({
            identifier: 'special',
            text: this.$t('special'),
            items: specialItems,
          });
        }

        categories.map((category) => {
          if (!this.viewOptions[category.identifier]) {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
            });
          }
        });

        return categories;
      },
    },
    methods: {
      sellItem (itemScope) {
        this.$root.$emit('sellItem', itemScope);
      },
      ownedItems (type) {
        let mappedItems = _filter(this.content[type], i => {
          return this.userItems[type][i.key] > 0;
        });

        switch (type) {
          case 'food':
            return _filter(mappedItems, f => {
              return f.key !== 'Saddle';
            });
          case 'special':
            if (this.userItems.food.Saddle) {
              return _filter(this.content.food, f => {
                return f.key === 'Saddle';
              });
            } else {
              return [];
            }
          default:
            return mappedItems;
        }
      },
      hasOwnedItemsForType (type) {
        return this.ownedItems(type).length > 0;
      },
      inventoryDrawerErrorMessage (type) {
        if (!this.hasOwnedItemsForType(type)) {
          // @TODO: Change any places using similar locales from `pets.json` and use these new locales from 'inventory.json'
          return this.$t('noItemsAvailableForType', { type: this.$t(`${type}ItemType`) });
        }
      },
      itemSelected (item) {
        this.$root.$emit('buyModal::showItem', item);
      },
      featuredItemSelected (item) {
        if (item.purchaseType === 'gear') {
          if (!item.locked) {
            this.itemSelected(item);
          }
        } else {
          this.itemSelected(item);
        }
      },
    },
  };
</script>
