<template lang="pug">
  .row.market
    .standard-sidebar
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        .form-group
          .form-check(
            v-for="category in categories",
            :key="category.identifier",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[category.identifier].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ category.text }}

        div.form-group.clearfix
          h3.float-left Hide locked
          toggle-switch.float-right.hideMissing(
            :label="''",
            v-model="hideLocked",
          )
        div.form-group.clearfix
          h3.float-left Hide pinned
          toggle-switch.float-right.hideMissing(
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
              span.text(v-once) {{ $t('featuredItems') }}
              span.rectangle

            div.items.margin-center
              shopItem(
                v-for="item in featuredItems",
                :key="item.key",
                :item="item",
                :price="item.value",
                :priceType="item.currency",
                :itemContentClass="'shop_'+item.key",
                :emptyItem="false",
                :popoverPosition="'top'",
                @click="selectedGearToBuy = item"
              )
                template(slot="popoverContent", scope="ctx")
                  equipmentAttributesPopover(:item="ctx.item")

      h1.mb-0.page-header(v-once) {{ $t('market') }}

      .clearfix
        h2.float-left
          | {{ $t('classEquipment') }}

        div.float-right
          span.dropdown-label {{ $t('class') }}
          b-dropdown(right=true)
            span.dropdown-icon-item(slot="text")
              span.svg-icon.inline.icon-16(v-html="icons[selectedGroupGearByClass]")
              span.text {{ getClassName(selectedGroupGearByClass) }}

            b-dropdown-item(
              v-for="sort in content.classes",
              @click="selectedGroupGearByClass = sort",
              :active="selectedGroupGearByClass === sort",
              :key="sort"
            )
              span.dropdown-icon-item
                span.svg-icon.inline.icon-16(v-html="icons[sort]")
                span.text {{ getClassName(sort) }}

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
        :showAllLabel="$t('showAllEquipment', { classType: getClassName(selectedGroupGearByClass) })",
        :showLessLabel="$t('showLessEquipment', { classType: getClassName(selectedGroupGearByClass) })"
      )
        template(slot="item", scope="ctx")
          shopItem(
            :key="ctx.item.key",
            :item="ctx.item",
            :price="ctx.item.value",
            :priceType="ctx.item.currency",
            :itemContentClass="'shop_'+ctx.item.key",
            :emptyItem="userItems.gear[ctx.item.key] === undefined",
            :popoverPosition="'top'",
            @click="selectedGearToBuy = ctx.item"
          )
            template(slot="popoverContent", scope="ctx")
              equipmentAttributesPopover(:item="ctx.item")
              div {{ ctx.item }}

            template(slot="itemBadge", scope="ctx")
              span.badge.badge-pill.badge-item.badge-svg(
                :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
                @click.prevent.stop="togglePinned(ctx.item)"
              )
                span.svg-icon.inline.icon-12.color(v-html="icons.pin")

      .clearfix
        h2.float-left
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
            v-for="item in sortedMarketItems(category, selectedSortItemsBy, searchTextThrottled)",
            :key="item.key",
            :item="item",
            :price="item.value",
            :priceType="item.currency",
            :itemContentClass="item.class",
            :emptyItem="false",
            :popoverPosition="'top'",
            @click="selectedItemToBuy = item"
          )
            span(slot="popoverContent")
              h4.popover-content-title {{ item.text }}
              div {{ item }}
              div {{ userItems[item.purchaseType][item.key] }}
            template(slot="itemBadge", scope="ctx")
              countBadge(
                :show="true",
                :count="userItems[item.purchaseType][item.key] || 0"
              )


      drawer(
        :title="$t('quickInventory')"
      )
        div(slot="drawer-header")
          drawer-header-tabs(
            :tabs="drawerTabs",
            @changedPosition="tabSelected($event)"
          )
            div(slot="right-item")
              b-popover(
                :triggers="['click']",
                :placement="'top'",
              )
                span(slot="content")
                  .popover-content-text(v-html="$t('petLikeToEatText')", v-once)

                div.hand-cursor(v-once)
                  | {{ $t('petLikeToEat') + ' ' }}
                  span.svg-icon.inline.icon-16(v-html="icons.information")

        drawer-slider(
          :items="ownedItems(selectedDrawerItemType) || []",
          slot="drawer-slider",
          :itemWidth=94,
          :itemMargin=24,
        )
          template(slot="item", scope="ctx")
            item(
              :item="ctx.item",
              :itemContentClass="getItemClass(selectedDrawerItemType, ctx.item.key)",
              popoverPosition="top",
              @click="selectedItemToSell = ctx.item"
            )
              template(slot="itemBadge", scope="ctx")
                countBadge(
                  :show="true",
                  :count="userItems[drawerTabs[selectedDrawerTab].contentType][ctx.item.key] || 0"
                )
              span(slot="popoverContent")
                h4.popover-content-title {{ ctx.item.text() }}

      sellModal(
        :item="selectedItemToSell",
        :itemType="selectedDrawerItemType",
        :itemCount="selectedItemToSell != null ? userItems[drawerTabs[selectedDrawerTab].contentType][selectedItemToSell.key] : 0",
        @change="resetItemToSell($event)"
      )
        template(slot="item", scope="ctx")
          item.flat(
            :item="ctx.item",
            :itemContentClass="getItemClass(selectedDrawerItemType, ctx.item.key)",
            :showPopover="false"
          )
            template(slot="itemBadge", scope="ctx")
              countBadge(
                :show="true",
                :count="userItems[drawerTabs[selectedDrawerTab].contentType][ctx.item.key] || 0"
              )

      buyModal(
        :item="selectedGearToBuy",
        priceType="gold",
        :withPin="true",
        @change="resetGearToBuy($event)"
      )
        template(slot="item", scope="ctx")
          div
            avatar(
              :member="user",
              :avatarOnly="true",
              :withBackground="true",
              :overrideAvatarGear="memberOverrideAvatarGear(selectedGearToBuy)"
            )

        template(slot="additionalInfo", scope="ctx")
          equipmentAttributesGrid.bordered(:item="ctx.item")

      buyModal(
        :item="selectedItemToBuy",
        :priceType="selectedItemToBuy ? selectedItemToBuy.currency : ''",
        @change="resetItemToBuy($event)"
      )
        template(slot="item", scope="ctx")
          item.flat(
            :item="ctx.item",
            :itemContentClass="ctx.item.class",
            :showPopover="false"
          )
</template>

<style lang="scss">
  @import '~client/assets/scss/colors.scss';

  .badge-svg {
    left: calc((100% - 18px) / 2);
    cursor: pointer;
    color: $gray-400;
    background: $white;
    padding: 4.5px 6px;

    &.item-selected-badge {
      background: $purple-300;
      color: $white;
    }
  }

  span.badge.badge-pill.badge-item.badge-svg:not(.item-selected-badge) {
    color: #a5a1ac;
  }

  span.badge.badge-pill.badge-item.badge-svg.hide {
    display: none;
  }

  .item:hover {
    span.badge.badge-pill.badge-item.badge-svg.hide {
      display: block;
    }
  }

  .icon-12 {
    width: 12px;
    height: 12px;
  }

  .hand-cursor {
    cursor: pointer;
  }

  .featuredItems {
    height: 216px;

    .background {
      background: url('~assets/images/market/shop_background.png');

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
      width: 100%;
      height: 216px;
      background: url('~assets/images/market/market_banner_web_alexnpc.png');
      background-repeat: no-repeat;

      .featured-label {
        position: absolute;
        bottom: -14px;
        margin: 0;
        left: 80px;
      }
    }
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

  .market {
    .avatar {
      cursor: default;
      margin: 0 auto;

      .character-sprites span {
        left: 25px;
      }
    }

    .standard-page {
      position: relative;
    }
  }
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import Item from 'client/components/inventory/item';
  import CountBadge from 'client/components/ui/countBadge';
  import Drawer from 'client/components/ui/drawer';
  import DrawerSlider from 'client/components/ui/drawerSlider';
  import DrawerHeaderTabs from 'client/components/ui/drawerHeaderTabs';
  import ItemRows from 'client/components/ui/itemRows';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import Avatar from 'client/components/avatar';

  import EquipmentAttributesPopover from 'client/components/inventory/equipment/attributesPopover';

  import SellModal from './sellModal.vue';
  import BuyModal from './buyModal.vue';
  import EquipmentAttributesGrid from './equipmentAttributesGrid.vue';

  import bPopover from 'bootstrap-vue/lib/components/popover';
  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

  import svgPin from 'assets/svg/pin.svg';
  import svgInformation from 'assets/svg/information.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import featuredItems from 'common/script/content/shop-featuredItems';

  import _filter from 'lodash/filter';
  import _sortBy from 'lodash/sortBy';
  import _map from 'lodash/map';
  import _throttle from 'lodash/throttle';

  const sortGearTypes = ['sortByType', 'sortByPrice', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'];

  const sortGearTypeMap = {
    sortByType: 'type',
    sortByPrice: 'value',
    sortByCon: 'con',
    sortByStr: 'str',
    sortByInt: 'int',
  };

export default {
    components: {
      ShopItem,
      Item,
      CountBadge,
      Drawer,
      DrawerSlider,
      DrawerHeaderTabs,
      ItemRows,
      toggleSwitch,

      bPopover,
      bDropdown,
      bDropdownItem,

      EquipmentAttributesPopover,
      SellModal,
      BuyModal,
      EquipmentAttributesGrid,
      Avatar,
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
        selectedGearToBuy: null,
        selectedItemToBuy: null,

        hideLocked: false,
        hidePinned: false,
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        market: 'shops.market.data',
        user: 'user.data',
        userStats: 'user.data.stats',
        userItems: 'user.data.items',
      }),
      categories () {
        if (this.market) {
          this.market.categories.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
            });
          });

          return this.market.categories;
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

      featuredItems () {
        return featuredItems.market.map(i => {
          return this.content.gear.flat[i];
        });
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
      filteredGear (groupByClass, searchBy, sortBy, hideLocked, hidePinned) {
        let result = _filter(this.content.gear.flat, ['klass', groupByClass]);
        result = _map(result, (e) => {
          return {
            ...e,
            pinned: false, // TODO read pinned state
            locked: this.isGearLocked(e),
          };
        });

        result = _filter(result, (gear) => {
          if (hideLocked && gear.locked) {
            return false;
          }
          if (hidePinned && gear.pinned) {
            return false;
          }

          if (searchBy) {
            let foundPosition = gear.text().toLowerCase().indexOf(searchBy);
            if (foundPosition === -1) {
              return false;
            }
          }

          // hide already owned
          return !this.userItems.gear.owned[gear.key];
        });

        result = _sortBy(result, [sortGearTypeMap[sortBy]]);

        return result;
      },
      sortedMarketItems (category, sortBy, searchBy) {
        let result = _filter(category.items, (i) => {
          return !searchBy || i.text.toLowerCase().indexOf(searchBy) !== -1;
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
      resetGearToBuy ($event) {
        if (!$event) {
          this.selectedGearToBuy = null;
        }
      },
      resetItemToBuy ($event) {
        if (!$event) {
          this.selectedItemToBuy = null;
        }
      },
      isGearLocked (gear) {
        if (gear.value > this.userStats.gp) {
          return true;
        }

        return false;
      },
      memberOverrideAvatarGear (gear) {
        return {
          [gear.type]: gear.key,
        };
      },
      togglePinned (item) {
        let isPinned = Boolean(item.pinned);
        item.pinned = !isPinned;
        this.$store.dispatch(isPinned ? 'shops:unpinGear' : 'shops:pinGear', {key: item.key});
      },
    },
    created () {
      this.$store.dispatch('shops:fetch');

      this.selectedGroupGearByClass = this.userStats.class;
    },
  };
</script>
