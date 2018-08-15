<template lang="pug">
  page-layout.market
    div(slot="sidebar")
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")
      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in categories",
            :key="category.identifier",
          )
            .custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.identifier].selected", :id="`category-${category.identifier}`")
              label.custom-control-label(v-once, :for="`category-${category.identifier}`") {{ category.text }}
        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hideLocked') }}
          toggle-switch.float-right(
            v-model="hideLocked",
          )
        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hidePinned') }}
          toggle-switch.float-right(
            v-model="hidePinned",
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

      layout-section(v-if="viewOptions['equipment'].selected", :title="$t('equipment')")
        div(slot="filters")
          filter-dropdown(
            :label="$t('class')",
            :initialItem="selectedGearCategory",
            :items="marketGearCategories",
            :withIcon="true",
            @selected="selectedGroupGearByClass = $event.id"
          )
            span(slot="item", slot-scope="ctx")
              span.svg-icon.inline.icon-16(v-html="icons[ctx.item.id]")
              span.text {{ getClassName(ctx.item.id) }}

          filter-dropdown(
            :label="$t('sortBy')",
            :initialItem="selectedSortGearBy",
            :items="sortGearBy",
            @selected="selectedSortGearBy = $event"
          )
            span(slot="item", slot-scope="ctx")
              span.text {{ $t(ctx.item.id) }}

        itemRows(
          :items="filteredGear(selectedGroupGearByClass, searchTextThrottled, selectedSortGearBy.id, hideLocked, hidePinned)",
          :itemWidth=94,
          :itemMargin=24,
          :type="'gear'",
          :noItemsLabel="$t('noGearItemsOfClass')",
          slot="content"
        )
          template(slot="item", slot-scope="ctx")
            shopItem(
              :key="ctx.item.key",
              :item="ctx.item",
              :emptyItem="userItems.gear[ctx.item.key] === undefined",
              :popoverPosition="'top'",
              @click="gearSelected(ctx.item)"
            )

              template(slot="itemBadge", slot-scope="ctx")
                span.badge.badge-pill.badge-item.badge-svg(
                  :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                  @click.prevent.stop="togglePinned(ctx.item)"
                )
                  span.svg-icon.inline.icon-12.color(v-html="icons.pin")

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

        div.items
          shopItem(
            v-for="item in sortedMarketItems(category, selectedSortItemsBy.id, searchTextThrottled, hidePinned)",
            :key="item.key",
            :item="item",
            :emptyItem="false",
            :popoverPosition="'top'",
            @click="itemSelected(item)"
          )
            span(slot="popoverContent")
              strong(v-if='item.key === "gem" && gemsLeft === 0') {{ $t('maxBuyGems') }}
              h4.popover-content-title {{ item.text }}
            template(slot="itemBadge", slot-scope="ctx")
              countBadge(
                v-if="item.showCount != false",
                :show="userItems[item.purchaseType][item.key] != 0",
                :count="userItems[item.purchaseType][item.key] || 0"
              )
              .badge.badge-pill.badge-purple.gems-left(v-if='item.key === "gem"')
                | {{ gemsLeft }}
              span.badge.badge-pill.badge-item.badge-svg(
                :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                @click.prevent.stop="togglePinned(ctx.item)"
              )
                span.svg-icon.inline.icon-12.color(v-html="icons.pin")

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
            template(slot="itemBadge")
              countBadge(
                :show="true",
                :count="ctx.itemCount"
              )
            span(slot="popoverContent")
              h4.popover-content-title {{ ctx.itemName }}

      sellModal
        template(slot="item", slot-scope="ctx")
          item.flat(
            :item="ctx.item",
            :itemContentClass="ctx.ctx.itemClass",
            :showPopover="false"
          )
            template(slot="itemBadge")
              countBadge(
                :show="true",
                :count="ctx.ctx.itemCount"
              )
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
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import ItemRows from 'client/components/ui/itemRows';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import Avatar from 'client/components/avatar';
  import InventoryDrawer from 'client/components/shared/inventoryDrawer';
  import FeaturedItemsHeader from '../featuredItemsHeader';
  import PageLayout from 'client/components/ui/pageLayout';
  import LayoutSection from 'client/components/ui/layoutSection';
  import FilterDropdown from 'client/components/ui/filterDropdown';

  import SellModal from './sellModal.vue';
  import EquipmentAttributesGrid from '../../inventory/equipment/attributesGrid.vue';
  import SelectMembersModal from 'client/components/selectMembersModal.vue';

  import svgPin from 'assets/svg/pin.svg';
  import svgGem from 'assets/svg/gem.svg';
  import svgInformation from 'assets/svg/information.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import getItemInfo from 'common/script/libs/getItemInfo';
  import isPinned from 'common/script/libs/isPinned';
  import shops from 'common/script/libs/shops';
  import planGemLimits from 'common/script/libs/planGemLimits';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _map from 'lodash/map';
  import _throttle from 'lodash/throttle';

  const sortGearTypes = ['sortByType', 'sortByPrice', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'].map(g => ({id: g}));
  const sortItems = ['AZ', 'sortByNumber'].map(g => ({id: g}));

  import notifications from 'client/mixins/notifications';
  import buyMixin from 'client/mixins/buy';
  import currencyMixin from '../_currencyMixin';
  import inventoryUtils from 'client/mixins/inventoryUtils';
  import pinUtils from 'client/mixins/pinUtils';

  const sortGearTypeMap = {
    sortByType: 'type',
    sortByPrice: 'value',
    sortByCon: 'con',
    sortByStr: 'str',
    sortByInt: 'int',
  };

export default {
    mixins: [notifications, buyMixin, currencyMixin, inventoryUtils, pinUtils],
    components: {
      ShopItem,
      KeysToKennel,
      Item,
      CountBadge,

      ItemRows,
      toggleSwitch,

      SellModal,
      EquipmentAttributesGrid,
      Avatar,

      InventoryDrawer,
      FeaturedItemsHeader,
      PageLayout,
      LayoutSection,
      FilterDropdown,

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
          warrior: svgWarrior,
          wizard: svgWizard,
          rogue: svgRogue,
          healer: svgHealer,
        }),

        selectedGroupGearByClass: '',

        sortGearBy: sortGearTypes,
        selectedSortGearBy: sortGearTypes[0],

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
      marketGearCategories () {
        return shops.getMarketGearCategories(this.user).map(c => {
          c.id = c.identifier;

          return c;
        });
      },
      selectedGearCategory () {
        return this.marketGearCategories.filter(c => c.id === this.selectedGroupGearByClass)[0];
      },
      market () {
        return shops.getMarketShop(this.user);
      },
      categories () {
        if (this.market) {
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
        } else {
          return [];
        }
      },
      gemsLeft () {
        if (!this.user.purchased.plan) return 0;
        return planGemLimits.convCap + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
      },
    },
    methods: {
      sellItem (itemScope) {
        this.$root.$emit('sellItem', itemScope);
      },
      getClassName (classType) {
        if (classType === 'wizard') {
          return this.$t('mage');
        } else {
          return this.$t(classType);
        }
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

      filteredGear (groupByClass, searchBy, sortBy, hideLocked, hidePinned) {
        let category = _filter(this.marketGearCategories, ['identifier', groupByClass]);

        let result = _filter(category[0].items, (gear) => {
          if (hideLocked && gear.locked) {
            return false;
          }
          if (hidePinned && gear.pinned) {
            return false;
          }

          if (searchBy) {
            let foundPosition = gear.text.toLowerCase().indexOf(searchBy);
            if (foundPosition === -1) {
              return false;
            }
          }

          // hide already owned
          return !this.userItems.gear.owned[gear.key];
        });

        // first all unlocked
        // then the selected sort
        result = _sortBy(result, [(item) => item.locked, sortGearTypeMap[sortBy]]);

        return result;
      },
      sortedMarketItems (category, sortBy, searchBy, hidePinned) {
        let result = _map(category.items, (e) => {
          return {
            ...e,
            pinned: isPinned(this.user, e),
          };
        });

        result = _filter(result, (item) => {
          if (hidePinned && item.pinned) {
            return false;
          }

          if (searchBy) {
            let foundPosition = item.text.toLowerCase().indexOf(searchBy);
            if (foundPosition === -1) {
              return false;
            }
          }

          return true;
        });

        switch (sortBy) {
          case 'AZ': {
            result = _sortBy(result, ['text']);

            break;
          }
          case 'sortByNumber': {
            result = _sortBy(result, item => {
              if (item.showCount === false) return 0;

              return this.userItems[item.purchaseType][item.key] || 0;
            });
            break;
          }
        }

        return result;
      },
      isGearLocked (gear) {
        if (gear.klass !== this.userStats.class) {
          return true;
        }

        return false;
      },
      itemSelected (item) {
        this.$root.$emit('buyModal::showItem', item);
      },
      featuredItemSelected (item) {
        if (item.purchaseType === 'gear') {
          this.gearSelected(item);
        } else {
          this.itemSelected(item);
        }
      },
      gearSelected (item) {
        if (!item.locked) {
          this.$root.$emit('buyModal::showItem', item);
        }
      },
    },
    created () {
      this.selectedGroupGearByClass = this.userStats.class;
    },
  };
</script>
