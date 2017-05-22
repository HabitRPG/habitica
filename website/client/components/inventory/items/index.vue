<template lang="pug">
.row
  .col-2.standard-sidebar
    .form-group
      input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

    .form
      h2(v-once) {{ $t('filter') }}
      h3(v-once) {{ $t('equipmentType') }}
      .form-group
        .form-check(
          v-for="group in groups",
          :key="group.key",
        )
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="group.selected")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t(group.key) }}
  .col-10.standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('items') }}
      .float-right
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t(sortBy)", right=true)
          b-dropdown-item(@click="sortBy = 'quantity'", :active="sortBy === 'quantity'") {{ $t('quantity') }}
          b-dropdown-item(@click="sortBy = 'AZ'", :active="sortBy === 'AZ'") {{ $t('AZ') }}
    div(
      v-for="group in groups",
      v-if="group.selected",
      :key="group.key",
    )
      h2
       | {{ $t(group.key) }}
       |
       span.badge.badge-pill.badge-default {{group.quantity}}

      .items
        item(
          v-for="({data: item, quantity}, index) in items[group.key]",
          v-if="group.open || index < itemsPerLine",
          :item="item",
          :key="item.key",
          :itemContentClass="`Pet_${group.classPrefix}_${item.key}`"
          :selected="true",
        )
          template(slot="popoverContent", scope="ctx") 
            h4.popover-content-title {{ ctx.item.text() }}
            .popover-content-text {{ ctx.item.notes() }}
          template(slot="itemBadge", scope="ctx")
            span.badge.badge-pill.badge-item.badge-quantity {{ quantity }}
      div(v-if="items[group.key].length === 0")
        p(v-once) {{ $t('noGearItemsOfType', { type: $t(group.key) }) }}
      a.btn.btn-show-more(
        v-if="items[group.key].length > itemsPerLine",
        @click="group.open = !group.open"
      ) {{ group.open ? $t('showLessGearItems', { type: $t(group.key) }) : $t('showAllGearItems', { type: $t(group.key), items: items[group.key].length }) }}

</template>

<style lang="scss" scoped>
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import throttle from 'lodash/throttle';

import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import Item from 'client/components/inventory/item';

const groups = [
  ['eggs', 'Egg'],
  ['hatchingPotions', 'HatchingPotion'],
  ['food', 'Food'],
].map(([group, classPrefix]) => {
  return {
    key: group,
    quantity: 0,
    selected: true,
    open: false,
    classPrefix,
  };
});

export default {
  name: 'Items',
  components: {
    Item,
    bDropdown,
    bDropdownItem,
  },
  data () {
    return {
      itemsPerLine: 9,
      searchText: null,
      searchTextThrottled: null,
      groups,
      sortBy: 'quantity', // or 'AZ'
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText;
    }, 250),
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
    }),
    items () {
      const searchText = this.searchTextThrottled;
      const itemsByType = {};

      this.groups.forEach(group => {
        const groupKey = group.key;
        let itemsArray = itemsByType[groupKey] = [];
        const contentItems = this.content[groupKey];

        each(this.user.items[groupKey], (itemQuantity, itemKey) => {
          if (itemQuantity > 0) {
            const item = contentItems[itemKey];

            const isSearched = !searchText || item.text().toLowerCase().indexOf(searchText) !== -1;
            if (isSearched) {
              itemsArray.push({
                data: item,
                quantity: itemQuantity,
              });

              group.quantity += itemQuantity;
            }
          }
        });

        itemsArray.sort((a, b) => {
          if (this.sortBy === 'quantity') {
            return b.quantity - a.quantity;
          } else { // AZ
            return a.data.text().localeCompare(b.data.text());
          }
        });
      });

      return itemsByType;
    },
  },
};
</script>
