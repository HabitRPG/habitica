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
          v-for="group in itemsGroups",
          :key="group",
        )
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="viewOptions[group].selected")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t(group) }}
  .col-10.standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('items') }}
      .float-right
        b-dropdown(:text="$t('sortBy')", right=true)
          b-dropdown-item(@click="sortBy = 'quantity'", :active="sortBy === 'quantity'") {{ $t('quantity') }}
          b-dropdown-item(@click="sortBy = 'AZ'", :active="sortBy === 'AZ'") {{ $t('sortAZ') }}

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

export default {
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
      viewOptions: {},
      groups: ['eggs', 'hatchingPotions', 'food'],
      sortBy: 'quanitty', // or 'AZ'
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

      this.itemsGroups.forEach(group => {
        itemsByType[group] = [];
        const contentItems = this.content[group];

        each(this.user.items[group], (quantity, itemKey) => {
          if (quantity < 0) return false;
          const item = contentItems[itemKey];

          const isSearched = !searchText || item.text().toLowerCase().indexOf(searchText) !== -1;
          if (!isSearched) return false;

          itemsByType[group].push(item);
        });
      });

      return itemsByType;
    },
    // TODO copied from Equipment, not used now but will in future once
    // not all items groups will be shown for all users (the special ones)
    itemsGroups () {
      return this.groups.map((group) => {
        this.$set(this.viewOptions, group, {
          selected: true,
          open: false,
        });

        return group;
      });
    },
  },
};
</script>
