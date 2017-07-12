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
</style>


<script>
  import {mapState} from 'client/libs/store';

  import ShopItem from '../shopItem';
  import CountBadge from 'client/components/ui/countBadge';

  import svgPin from 'assets/svg/pin.svg';

export default {
    components: {
      ShopItem,
      CountBadge,
    },
    computed: {
      ...mapState({
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
    },
    data () {
      return {
        viewOptions: {},

        icons: Object.freeze({
          pin: svgPin,
        }),
      };
    },
    created () {
      this.$store.dispatch('shops:fetch');
    },
  };
</script>
