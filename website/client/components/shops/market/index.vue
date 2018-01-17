<template lang="pug">
  .row.market
    .standard-sidebar.d-none.d-sm-block
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
          toggle-switch.float-right.no-margin(
            :label="''",
            v-model="hideLocked",
          )
        div.form-group.clearfix
          h3.float-left(v-once) {{ $t('hidePinned') }}
          toggle-switch.float-right.no-margin(
            :label="''",
            v-model="hidePinned",
          )
    .standard-page
      div.featuredItems
        .background
          div.npc
            div.featured-label
              span.rectangle
              span.text Alex
              span.rectangle
          div.content
            div.featured-label.with-border
              span.rectangle
              span.text {{ market.featured.text }}
              span.rectangle

            div.items.margin-center
              shopItem(
                v-for="item in market.featured.items",
                :key="item.key",
                :item="item",
                :price="item.value",
                :itemContentClass="'shop_'+item.key",
                :emptyItem="false",
                :popoverPosition="'top'",
                @click="featuredItemSelected(item)"
              )
                template(slot="itemBadge", slot-scope="ctx")
                  span.badge.badge-pill.badge-item.badge-svg(
                    :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                    @click.prevent.stop="togglePinned(ctx.item)"
                  )
                    span.svg-icon.inline.icon-12.color(v-html="icons.pin")

      h1.mb-4.page-header(v-once) {{ $t('market') }}

      .clearfix(v-if="viewOptions['equipment'].selected")
        h2.float-left.mb-3.filters-title
          | {{ $t('equipment') }}

        .filters.float-right
          span.dropdown-label {{ $t('class') }}
          b-dropdown(right=true)
            span.dropdown-icon-item(slot="text")
              span.svg-icon.inline.icon-16(v-html="icons[selectedGroupGearByClass]")
              span.text {{ getClassName(selectedGroupGearByClass) }}

            b-dropdown-item(
              v-for="gearCategory in marketGearCategories",
              @click="selectedGroupGearByClass = gearCategory.identifier",
              :active="selectedGroupGearByClass === gearCategory.identifier",
              :key="gearCategory.identifier"
            )
              span.dropdown-icon-item
                span.svg-icon.inline.icon-16(v-html="icons[gearCategory.identifier]")
                span.text {{ gearCategory.text }}

          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t(selectedSortGearBy)", right=true)
            b-dropdown-item(
              v-for="sort in sortGearBy",
              @click="selectedSortGearBy = sort",
              :active="selectedSortGearBy === sort",
              :key="sort"
            ) {{ $t(sort) }}

      br

      itemRows(
        :items="filteredGear(selectedGroupGearByClass, searchTextThrottled, selectedSortGearBy, hideLocked, hidePinned)",
        :itemWidth=94,
        :itemMargin=24,
        :type="'gear'",
        :noItemsLabel="$t('noGearItemsOfClass')",
        v-if="viewOptions['equipment'].selected"
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

      .clearfix
        h2.float-left.mb-3
          | {{ $t('items') }}

        div.float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t(selectedSortItemsBy)", right=true)
            b-dropdown-item(
              v-for="sort in sortItemsBy",
              @click="selectedSortItemsBy = sort",
              :active="selectedSortItemsBy === sort",
              :key="sort"
            ) {{ $t(sort) }}


      div(
        v-for="category in categories",
        v-if="viewOptions[category.identifier].selected"
      )
        h4 {{ category.text }}

        div.items
          shopItem(
            v-for="item in sortedMarketItems(category, selectedSortItemsBy, searchTextThrottled, hidePinned)",
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

          //keys-to-kennel(v-if='category.identifier === "special"')

        div.fill-height

      //- @TODO: Create new InventoryDrawer component and re-use in 'inventory/stable' component.
      drawer(
        :title="$t('quickInventory')"
        :errorMessage="inventoryDrawerErrorMessage(selectedDrawerItemType)"
      )
        div(slot="drawer-header")
          drawer-header-tabs(
            :tabs="drawerTabs",
            @changedPosition="tabSelected($event)"
          )
            div(slot="right-item")
              #petLikeToEatMarket.drawer-help-text(v-once)
                | {{ $t('petLikeToEat') + ' ' }}
                span.svg-icon.inline.icon-16(v-html="icons.information")
              b-popover(
                target="petLikeToEatMarket",
                :placement="'top'",
              )
                .popover-content-text(v-html="$t('petLikeToEatText')", v-once)

        drawer-slider(
          v-if="hasOwnedItemsForType(selectedDrawerItemType)"
          :items="ownedItems(selectedDrawerItemType) || []",
          slot="drawer-slider",
          :itemWidth=94,
          :itemMargin=24,
          :itemType="selectedDrawerTab"
        )
          template(slot="item", slot-scope="ctx")
            item(
              :item="ctx.item",
              :itemContentClass="getItemClass(selectedDrawerItemType, ctx.item.key)",
              popoverPosition="top",
              @click="selectedItemToSell = ctx.item"
            )
              template(slot="itemBadge", slot-scope="ctx")
                countBadge(
                  :show="true",
                  :count="userItems[drawerTabs[selectedDrawerTab].contentType][ctx.item.key] || 0"
                )
              span(slot="popoverContent")
                h4.popover-content-title {{ getItemName(selectedDrawerItemType, ctx.item) }}

      sellModal(
        :item="selectedItemToSell",
        :itemType="selectedDrawerItemType",
        :itemCount="selectedItemToSell != null ? userItems[drawerTabs[selectedDrawerTab].contentType][selectedItemToSell.key] : 0",
        :text="selectedItemToSell != null ? getItemName(selectedDrawerItemType, selectedItemToSell) : ''",
        @change="resetItemToSell($event)"
      )
        template(slot="item", slot-scope="ctx")
          item.flat(
            :item="ctx.item",
            :itemContentClass="getItemClass(selectedDrawerItemType, ctx.item.key)",
            :showPopover="false"
          )
            template(slot="itemBadge", slot-scope="ctx")
              countBadge(
                :show="true",
                :count="userItems[drawerTabs[selectedDrawerTab].contentType][ctx.item.key] || 0"
              )
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/variables.scss';

  .market .drawer-slider {
    min-height: 60px;

    .message {
      top: 10px;
    }
  }

  .fill-height {
    height: 38px; // button + margin + padding
  }


  .icon-48 {
    width: 48px;
    height: 48px;
  }

  .featured-label {
    margin: 24px auto;
  }

  .bordered {
    border-radius: 2px;
    background-color: #f9f9f9;
    margin-bottom: 24px;
    padding: 24px 24px 10px;
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

    .standard-page {
      position: relative;
    }

    .featuredItems {
      height: 216px;

      .background {
        background: url('~assets/images/npc/#{$npc_market_flavor}/market_background.png');

        background-repeat: repeat-x;

        width: 100%;
        height: 216px;
        position: absolute;

        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .content {
        display: flex;
        flex-direction: column;
      }

      .npc {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 216px;
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

  @media only screen and (max-width: 768px) {
    .featuredItems .content {
      display: none !important;
    }

    .filters, .filters-title {
      float: none;
      button {
        margin-right: 4em;
        margin-bottom: 1em;
      }
    }
  }
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import KeysToKennel from './keysToKennel';
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import Drawer from 'client/components/ui/drawer';
  import DrawerSlider from 'client/components/ui/drawerSlider';
  import DrawerHeaderTabs from 'client/components/ui/drawerHeaderTabs';
  import ItemRows from 'client/components/ui/itemRows';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import Avatar from 'client/components/avatar';

  import SellModal from './sellModal.vue';
  import EquipmentAttributesGrid from './equipmentAttributesGrid.vue';
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

  const sortGearTypes = ['sortByType', 'sortByPrice', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'];

  import notifications from 'client/mixins/notifications';
  import buyMixin from 'client/mixins/buy';
  import currencyMixin from '../_currencyMixin';

  const sortGearTypeMap = {
    sortByType: 'type',
    sortByPrice: 'value',
    sortByCon: 'con',
    sortByStr: 'str',
    sortByInt: 'int',
  };

export default {
    mixins: [notifications, buyMixin, currencyMixin],
    components: {
      ShopItem,
      KeysToKennel,
      Item,
      CountBadge,
      Drawer,
      DrawerSlider,
      DrawerHeaderTabs,
      ItemRows,
      toggleSwitch,

      SellModal,
      EquipmentAttributesGrid,
      Avatar,

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

        selectedDrawerTab: 0,
        selectedDrawerItemType: 'eggs',

        selectedGroupGearByClass: '',

        sortGearBy: sortGearTypes,
        selectedSortGearBy: 'sortByType',

        sortItemsBy: ['AZ', 'sortByNumber'],
        selectedSortItemsBy: 'AZ',

        selectedItemToSell: null,

        hideLocked: false,
        hidePinned: false,
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),
      marketGearCategories () {
        return shops.getMarketGearCategories(this.user);
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
      drawerTabs () {
        return [
          {
            key: 'eggs',
            contentType: 'eggs',
            label: this.$t('eggs'),
          },
          {
            key: 'food',
            contentType: 'food',
            label: this.$t('foodTitle'),
          },
          {
            key: 'hatchingPotions',
            contentType: 'hatchingPotions',
            label: this.$t('hatchingPotions'),
          },
          {
            key: 'special',
            contentType: 'food',
            label: this.$t('special'),
          },
        ];
      },
      gemsLeft () {
        if (!this.user.purchased.plan) return 0;
        return planGemLimits.convCap + this.user.purchased.plan.consecutive.gemCapExtra - this.user.purchased.plan.gemsBought;
      },
    },
    methods: {
      getClassName (classType) {
        if (classType === 'wizard') {
          return this.$t('mage');
        } else {
          return this.$t(classType);
        }
      },
      tabSelected ($event) {
        this.selectedDrawerTab = $event;
        this.selectedDrawerItemType = this.drawerTabs[$event].key;
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
      getItemClass (type, itemKey) {
        switch (type) {
          case 'food':
          case 'special':
            return `Pet_Food_${itemKey}`;
          case 'eggs':
            return `Pet_Egg_${itemKey}`;
          case 'hatchingPotions':
            return `Pet_HatchingPotion_${itemKey}`;
          default:
            return '';
        }
      },
      getItemName (type, item) {
        switch (type) {
          case 'eggs':
            return this.$t('egg', {eggType: item.text()});
          case 'hatchingPotions':
            return this.$t('potion', {potionType: item.text()});
          default:
            return item.text();
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
            result = _sortBy(result, i => {
              return this.userItems[i.purchaseType][i.key] || 0;
            });
            break;
          }
        }

        return result;
      },
      resetItemToSell ($event) {
        if (!$event) {
          this.selectedItemToSell = null;
        }
      },
      isGearLocked (gear) {
        if (gear.klass !== this.userStats.class) {
          return true;
        }

        return false;
      },
      togglePinned (item) {
        if (!this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path})) {
          this.$parent.showUnpinNotification(item);
        }
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
