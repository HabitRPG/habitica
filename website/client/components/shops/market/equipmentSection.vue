<template lang="pug">
layout-section(:title="$t('equipment')")
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

  itemRows.equipment-rows(
    :items="sortedGearItems",
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
</template>

<script>
  import {mapState} from 'client/libs/store';
  import LayoutSection from 'client/components/ui/layoutSection';
  import FilterDropdown from 'client/components/ui/filterDropdown';
  import ItemRows from 'client/components/ui/itemRows';
  import ShopItem from '../shopItem';

  import shops from 'common/script/libs/shops';

  import svgPin from 'assets/svg/pin.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import _filter from 'lodash/filter';
  import _orderBy from 'lodash/orderBy';
  import pinUtils from '../../../mixins/pinUtils';

  const sortGearTypes = ['sortByType', 'sortByPrice', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'].map(g => ({id: g}));

  const sortGearTypeMap = {
    sortByType: 'type',
    sortByPrice: 'value',
    sortByCon: 'con',
    sortByPer: 'per',
    sortByStr: 'str',
    sortByInt: 'int',
  };

  export default {
    mixins: [pinUtils],
    props: ['hideLocked', 'hidePinned', 'searchBy'],
    components: {
      LayoutSection,
      FilterDropdown,
      ItemRows,
      ShopItem,
    },
    data () {
      return {
        sortGearBy: sortGearTypes,
        selectedSortGearBy: sortGearTypes[0],
        selectedGroupGearByClass: '',
        icons: Object.freeze({
          pin: svgPin,
          warrior: svgWarrior,
          wizard: svgWizard,
          rogue: svgRogue,
          healer: svgHealer,
        }),
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        user: 'user.data',
        userItems: 'user.data.items',
        userStats: 'user.data.stats',
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
      sortedGearItems () {
        let result = this.filterGearItems();
        let selectedSortKey = sortGearTypeMap[this.selectedSortGearBy.id];
        let sortingByStat = selectedSortKey !== 'type' && selectedSortKey !== 'value';
        let order = sortingByStat ? 'desc' : 'asc';

        // split into unlocked and locked, then apply selected sort
        return _orderBy(result, ['locked', selectedSortKey], ['asc', order]);
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
      gearSelected (item) {
        if (!item.locked) {
          this.$root.$emit('buyModal::showItem', item);
        }
      },
      filterGearItems () {
        let category = _filter(this.marketGearCategories, ['identifier', this.selectedGroupGearByClass]);
        let items = category[0].items;

        return _filter(items, (gear) => {
          if (this.hideLocked && gear.locked) {
            return false;
          }
          if (this.hidePinned && gear.pinned) {
            return false;
          }

          if (this.searchBy) {
            let foundPosition = gear.text.toLowerCase().indexOf(this.searchBy);
            if (foundPosition === -1) {
              return false;
            }
          }

          // hide already owned
          return !this.userItems.gear.owned[gear.key];
        });
      },
    },
    created () {
      this.selectedGroupGearByClass = this.userStats.class;
    },
  };
</script>

<style lang="scss" scoped>
  .equipment-rows {
    /deep/ .item.item-empty {
      background: white;
    }
  }
</style>
