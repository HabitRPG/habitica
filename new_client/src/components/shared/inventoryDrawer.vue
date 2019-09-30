<template lang="pug">
drawer.inventoryDrawer(
  :title="$t('quickInventory')"
  :errorMessage="inventoryDrawerErrorMessage(selectedDrawerItemType)"
)
  div(slot="drawer-header")
    drawer-header-tabs(
      :tabs="filteredTabs",
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
      slot(
        name="item",
        :item="ctx.item",
        :itemClass="getItemClass(selectedDrawerContentType, ctx.item.key)",
        :itemCount="userItems[selectedDrawerContentType][ctx.item.key] || 0",
        :itemName="getItemName(selectedDrawerItemType, ctx.item)",
        :itemType="selectedDrawerItemType"
      )


</template>

<script>
  import {mapState} from 'client/libs/store';
  import inventoryUtils from 'client/mixins/inventoryUtils';
  import svgInformation from 'assets/svg/information.svg';
  import _filter from 'lodash/filter';

  import CountBadge from 'client/components/ui/countBadge';
  import Item from 'client/components/inventory/item';
  import Drawer from 'client/components/ui/drawer';
  import DrawerSlider from 'client/components/ui/drawerSlider';
  import DrawerHeaderTabs from 'client/components/ui/drawerHeaderTabs';

  export default {
    mixins: [inventoryUtils],
    components: {
      Item,
      CountBadge,
      Drawer,
      DrawerSlider,
      DrawerHeaderTabs,
    },
    props: {
      defaultSelectedTab: {
        type: Number,
        default: 0,
      },
      showEggs: Boolean,
      showPotions: Boolean,
    },
    data () {
      return {
        drawerTabs: [
          {
            key: 'eggs',
            label: this.$t('eggs'),
            show: () => this.showEggs,
          },
          {
            key: 'food',
            label: this.$t('foodTitle'),
            show: () => true,
          },
          {
            key: 'hatchingPotions',
            label: this.$t('hatchingPotions'),
            show: () => this.showPotions,
          },
          {
            key: 'special',
            contentType: 'food',
            label: this.$t('special'),
            show: () => true,
          },
        ],
        selectedDrawerTab: this.defaultSelectedTab,

        icons: Object.freeze({
          information: svgInformation,
        }),
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        userItems: 'user.data.items',
      }),
      selectedDrawerItemType () {
        return this.filteredTabs[this.selectedDrawerTab].key;
      },
      selectedDrawerContentType () {
        return this.filteredTabs[this.selectedDrawerTab].contentType ||
          this.selectedDrawerItemType;
      },
      filteredTabs () {
        return this.drawerTabs.filter(t => t.show());
      },
    },
    methods: {
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
      tabSelected ($event) {
        this.selectedDrawerTab = $event;
      },
      hasOwnedItemsForType (type) {
        return this.ownedItems(type).length > 0;
      },
      inventoryDrawerErrorMessage (type) {
        if (!this.hasOwnedItemsForType(type)) {
          switch (type) {
            case 'food': return this.$t('noFoodAvailable');
            case 'special': return this.$t('noSaddlesAvailable');
            default:
              // @TODO: Change any places using similar locales from `pets.json` and use these new locales from 'inventory.json'
              return this.$t('noItemsAvailableForType', {type: this.$t(`${type}ItemType`)});
          }
        }
      },
    },
  };
</script>

<style lang="scss">
  .inventoryDrawer {
    .drawer-slider {
      height: 126px;
    }
  }
</style>
