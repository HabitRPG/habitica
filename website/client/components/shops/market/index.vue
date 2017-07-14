<template lang="pug">
  .row
    .standard-sidebar
      .form-group
        //input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

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

    .standard-page
      h1.mb-0.page-header(v-once) {{ $t('market') }}

      .clearfix
        h2
          | {{ $t('items') }}

      div(
        v-for="category in categories",
        v-if="viewOptions[category.identifier].selected"
      )
        h4 {{ category.text }} - {{ category.items.length }}

        div.items
          shopItem(
            v-for="item in category.items",
            :key="item.key",
            :item="item",
            :price="item.value",
            :priceType="item.currency",
            :itemContentClass="item.class",
            :emptyItem="false",
            :popoverPosition="'top'",
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

              // span.badge.badge-pill.badge-item.badge-svg(
              //  :class="{'item-selected-badge': true}",
              //  @click="click",
              // )
              //  span.svg-icon.inline.icon-12(v-html="icons.pin")
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
              @click="openSellDialog(selectedDrawerItemType, ctx.item)"
            )
              template(slot="itemBadge", scope="ctx")
                countBadge(
                  :show="true",
                  :count="userItems[drawerTabs[selectedDrawerTab].contentType][ctx.item.key] || 0"
                )
              span(slot="popoverContent")
                h4.popover-content-title {{ ctx.item.text() }}
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
      background: $teal-50;
      color: $white;
    }
  }

  .icon-12 {
    width: 12px;
    height: 12px;
  }

  .hand-cursor {
    cursor: pointer;
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

  import bPopover from 'bootstrap-vue/lib/components/popover';

  import svgPin from 'assets/svg/pin.svg';
  import svgInformation from 'assets/svg/information.svg';

  import _filter from 'lodash/filter';

export default {
    components: {
      ShopItem,
      Item,
      CountBadge,
      Drawer,
      DrawerSlider,
      DrawerHeaderTabs,
      bPopover,
    },
    computed: {
      ...mapState({
        content: 'content',
        market: 'shops.market.data',
        userItems: 'user.data.items',
      }),
      categories () {
        if (this.market) {
          this.market.categories.map((category) => {
            this.$set(this.viewOptions, category.identifier, {
              selected: true,
              open: false,
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
    },
    methods: {
      tabSelected ($event) {
        this.selectedDrawerTab = $event;
        this.selectedDrawerItemType = this.drawerTabs[$event].key;
      },
      ownedItems (type) {
        let mappedItems = _filter(this.content[type], i => {
          return this.userItems[type][i.key] > 0;
        });

        console.info('content', this.content);
        console.info('userItems', this.userItems);

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
      openSellDialog (type, item) {
        alert(item.key);
      },
    },
    data () {
      return {
        viewOptions: {},

        icons: Object.freeze({
          pin: svgPin,
          information: svgInformation,
        }),

        selectedDrawerTab: 0,
        selectedDrawerItemType: 'eggs',
      };
    },
    created () {
      this.$store.dispatch('shops:fetch');
    },
  };
</script>
