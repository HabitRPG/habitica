<template>
  <drawer
    ref="drawer"
    class="inventoryDrawer"
    :no-title-bottom-padding="true"
    :error-message="inventoryDrawerErrorMessage(selectedDrawerItemType)"
  >
    <div
      slot="drawer-title-row"
      class="title-row-tabs"
    >
      <div
        v-for="(tab, index) of filteredTabs"
        :key="tab.key"
        class="drawer-tab"
      >
        <a
          class="drawer-tab-text"
          :class="{'drawer-tab-text-active': filteredTabs[selectedDrawerTab].key === tab.key}"
          @click.prevent.stop="tabSelected(index); $refs.drawer.open();"
        >{{ tab.label }}</a>
      </div>
    </div>
    <div slot="drawer-header">
      <drawer-header-tabs
        :tabs="[]"
        @changedPosition="tabSelected($event)"
      >
        <div slot="right-item">
          <div
            v-once
            id="petLikeToEatMarket"
            class="drawer-help-text"
          >
            <span>{{ $t('petLikeToEat') + ' ' }}</span>
            <span
              class="svg-icon inline icon-16"
              v-html="icons.information"
            ></span>
          </div>
          <b-popover
            target="petLikeToEatMarket"
            :placement="'top'"
          >
            <div
              v-once
              class="popover-content-text"
              v-html="$t('petLikeToEatText')"
            ></div>
          </b-popover>
        </div>
      </drawer-header-tabs>
    </div>
    <drawer-slider
      v-if="hasOwnedItemsForType(selectedDrawerItemType)"
      slot="drawer-slider"
      :items="ownedItems(selectedDrawerItemType) || []"
      :item-width="94"
      :item-margin="24"
      :item-type="selectedDrawerTab"
    >
      <template
        slot="item"
        slot-scope="ctx"
      >
        <slot
          name="item"
          :item="ctx.item"
          :itemClass="getItemClass(selectedDrawerContentType, ctx.item.key)"
          :itemCount="userItems[selectedDrawerContentType][ctx.item.key] || 0"
          :itemName="getItemName(selectedDrawerItemType, ctx.item)"
          :itemType="selectedDrawerItemType"
        ></slot>
      </template>
    </drawer-slider>
  </drawer>
</template>

<script>
import _filter from 'lodash/filter';
import { mapState } from '@/libs/store';
import inventoryUtils from '@/mixins/inventoryUtils';
import svgInformation from '@/assets/svg/information.svg';

import Drawer from '@/components/ui/drawer';
import DrawerSlider from '@/components/ui/drawerSlider';
import DrawerHeaderTabs from '@/components/ui/drawerHeaderTabs';

export default {
  components: {
    Drawer,
    DrawerSlider,
    DrawerHeaderTabs,
  },
  mixins: [inventoryUtils],
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
      return this.filteredTabs[this.selectedDrawerTab].contentType
          || this.selectedDrawerItemType;
    },
    filteredTabs () {
      return this.drawerTabs.filter(t => t.show());
    },
  },
  methods: {
    ownedItems (type) {
      const mappedItems = _filter(this.content[type], i => this.userItems[type][i.key] > 0);

      switch (type) {
        case 'food':
          return _filter(mappedItems, f => f.key !== 'Saddle');
        case 'special':
          if (this.userItems.food.Saddle) {
            return _filter(this.content.food, f => f.key === 'Saddle');
          }
          return [];

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
            // @TODO: Change any places using similar locales
            // from `pets.json` and use these new locales from 'inventory.json'
            return this.$t('noItemsAvailableForType', { type: this.$t(`${type}ItemType`) });
        }
      }

      return null;
    },
  },
};
</script>

<style lang="scss">
  .inventoryDrawer {
    .drawer-slider {
      height: 126px;
    }

    .drawer-tab-text {
      display: inline-block;
    }

    .drawer-help-text {
      display: flex;
      margin-top: 0.65rem;

      .svg-icon {
        position: inherit;
        top: 0;
      }
    }

    .title-row-tabs {
      display: flex;
      justify-content: center;

      .drawer-tab {
        background: transparent;
      }
    }
  }
</style>
