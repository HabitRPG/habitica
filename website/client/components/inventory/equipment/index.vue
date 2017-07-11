<template lang="pug">
.row
  .standard-sidebar
    .form-group
      input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

    .form
      h2(v-once) {{ $t('filter') }}
      h3 {{ this.groupBy === 'type' ? $t('equipmentType') : $t('class') }}
      .form-group
        .form-check(
          v-for="group in itemsGroups",
          :key="group.key",
        )
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="viewOptions[group.key].selected")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ group.label }}

  .standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('equipment') }}
      .float-right
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="'Sort 1'", right=true)
          b-dropdown-item(href="#") Option 1
          b-dropdown-item(href="#") Option 2
          b-dropdown-item(href="#") Option 3
        span.dropdown-label {{ $t('groupBy2') }}
        b-dropdown(:text="$t(groupBy === 'type' ? 'equipmentType' : 'class')", right=true)
          b-dropdown-item(@click="groupBy = 'type'", :active="groupBy === 'type'") {{ $t('equipmentType') }}
          b-dropdown-item(@click="groupBy = 'class'", :active="groupBy === 'class'") {{ $t('class') }}

    drawer(
      :title="$t('equipment')",
      :errorMessage="(costume && !user.preferences.costume) ? $t('costumeDisabled') : null",
    )
      div(slot="drawer-header")
        .drawer-tab-container
          .drawer-tab.text-right
            a.drawer-tab-text(
              @click="costume = false",
              :class="{'drawer-tab-text-active': costume === false}",
            ) {{ $t('equipment') }}
          .clearfix
            .drawer-tab.float-left
              a.drawer-tab-text(
                @click="costume = true",
                :class="{'drawer-tab-text-active': costume === true}",
              ) {{ $t('costume') }}

            b-popover(
              :triggers="['hover']",
              :placement="'top'"
            )
              span(slot="content")
                .popover-content-text {{ $t(drawerPreference+'PopoverText') }}

              toggle-switch.float-right(
                :label="$t(costume ? 'useCostume' : 'autoEquipBattleGear')",
                :checked="user.preferences[drawerPreference]",
                @change="changeDrawerPreference",
              )

      .items.items-one-line(slot="drawer-slider")
        item(
          v-for="(label, group) in gearTypesToStrings",
          :key="group",
          :item="flatGear[activeItems[group]]",
          :itemContentClass="flatGear[activeItems[group]] ? 'shop_' + flatGear[activeItems[group]].key : null",
          :emptyItem="!flatGear[activeItems[group]] || flatGear[activeItems[group]].key.indexOf('_base_0') !== -1",
          :label="label",
          :popoverPosition="'top'",
        )
          template(slot="popoverContent", scope="ctx")
            equipmentAttributesPopover(:item="ctx.item")
          template(slot="itemBadge", scope="ctx")
            starBadge(
              :selected="true",
              :show="!costume || user.preferences.costume",
              @click="equip(ctx.item)",
            )
    div(
      v-for="group in itemsGroups",
      v-if="viewOptions[group.key].selected",
      :key="group.key",
    )
      h2
       | {{ group.label }}
       |
       span.badge.badge-pill.badge-default {{items[group.key].length}}

      .items
        item(
          v-for="(item, index) in items[group.key]",
          v-if="viewOptions[group.key].open || index < itemsPerLine",
          :item="item",
          :itemContentClass="'shop_' + item.key",
          :emptyItem="!item || item.key.indexOf('_base_0') !== -1",
          :key="item.key",
        )
          template(slot="itemBadge", scope="ctx")
            starBadge(
              :selected="activeItems[ctx.item.type] === ctx.item.key",
              :show="!costume || user.preferences.costume",
              @click="equip(ctx.item)",
            )
          template(slot="popoverContent", scope="ctx")
            equipmentAttributesPopover(:item="ctx.item")
      div(v-if="items[group.key].length === 0")
        p(v-once) {{ $t('noGearItemsOfType', { type: group.label }) }}
      a.btn.btn-show-more(
        v-if="items[group.key].length > itemsPerLine",
        @click="viewOptions[group.key].open = !viewOptions[group.key].open"
      ) {{ viewOptions[group.key].open ? $t('showLessItems', { type: group.label }) : $t('showAllItems', { type: group.label, items: items[group.key].length }) }}
</template>

<style lang="scss" scoped>
h2 {
  margin-top: 24px;
}
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import map from 'lodash/map';
import throttle from 'lodash/throttle';

import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import bPopover from 'bootstrap-vue/lib/components/popover';
import toggleSwitch from 'client/components/ui/toggleSwitch';

import Item from 'client/components/inventory/item';
import EquipmentAttributesPopover from 'client/components/inventory/equipment/attributesPopover';
import StarBadge from 'client/components/inventory/starBadge';
import Drawer from 'client/components/inventory/drawer';

import i18n from 'common/script/i18n';

export default {
  name: 'Equipment',
  components: {
    Item,
    EquipmentAttributesPopover,
    StarBadge,
    Drawer,
    bDropdown,
    bDropdownItem,
    bPopover,
    toggleSwitch,
  },
  data () {
    return {
      itemsPerLine: 9,
      searchText: null,
      searchTextThrottled: null,
      costume: false,
      groupBy: 'type', // or 'class'
      gearTypesToStrings: Object.freeze({ // TODO use content.itemList?
        headAccessory: i18n.t('headAccessoryCapitalized'),
        head: i18n.t('headgearCapitalized'),
        eyewear: i18n.t('eyewear'),
        weapon: i18n.t('weaponCapitalized'),
        shield: i18n.t('offhandCapitalized'),
        armor: i18n.t('armorCapitalized'),
        body: i18n.t('body'),
        back: i18n.t('back'),
      }),
      gearClassesToStrings: Object.freeze({
        warrior: i18n.t('warrior'),
        wizard: i18n.t('mage'),
        rogue: i18n.t('rogue'),
        healer: i18n.t('healer'),
        special: i18n.t('special'),
        mystery: i18n.t('mystery'),
        armoire: i18n.t('armoireText'),
      }),
      viewOptions: {},
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText;
    }, 250),
  },
  methods: {
    equip (item) {
      this.$store.dispatch('common:equip', {key: item.key, type: this.costume ? 'costume' : 'equipped'});
    },
    changeDrawerPreference (newVal) {
      this.$store.dispatch('user:set', {
        [`preferences.${this.drawerPreference}`]: newVal,
      });
    },
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      ownedItems: 'user.data.items.gear.owned',
      equippedItems: 'user.data.items.gear.equipped',
      costumeItems: 'user.data.items.gear.costume',
      flatGear: 'content.gear.flat',
    }),
    drawerPreference () {
      return this.costume === true ? 'costume' : 'autoEquip';
    },
    activeItems () {
      return this.costume === true ? this.costumeItems : this.equippedItems;
    },
    gearItemsByType () {
      const searchText = this.searchTextThrottled;
      const gearItemsByType = {};
      each(this.gearTypesToStrings, (string, type) => {
        gearItemsByType[type] = [];
      });

      each(this.ownedItems, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.flatGear[gearKey];

          const isSearched = !searchText || ownedItem.text().toLowerCase().indexOf(searchText) !== -1;

          if (ownedItem.klass !== 'base' && isSearched) {
            const type = ownedItem.type;
            const isEquipped = this.activeItems[type] === ownedItem.key;
            const viewOptions = this.viewOptions[type];
            const firstRender = viewOptions.firstRender;
            const itemsInFirstPosition = viewOptions.itemsInFirstPosition;

            // Render selected items in first postion only for the first render
            if (itemsInFirstPosition.indexOf(ownedItem.key) !== -1 && firstRender === false) {
              gearItemsByType[type].unshift(ownedItem);
            } else if (isEquipped === true && firstRender === true) {
              gearItemsByType[type].unshift(ownedItem);
              itemsInFirstPosition.push(ownedItem.key);
            } else {
              gearItemsByType[type].push(ownedItem);
            }
          }
        }
      });


      each(this.gearTypesToStrings, (string, type) => {
        this.viewOptions[type].firstRender = false;
      });

      return gearItemsByType;
    },
    gearItemsByClass () {
      const searchText = this.searchTextThrottled;
      const gearItemsByClass = {};
      each(this.gearClassesToStrings, (string, klass) => {
        gearItemsByClass[klass] = [];
      });

      each(this.ownedItems, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.flatGear[gearKey];
          const klass = ownedItem.klass;

          const isSearched = !searchText || ownedItem.text().toLowerCase().indexOf(searchText) !== -1;

          if (klass !== 'base' && isSearched) {
            const isEquipped = this.activeItems[ownedItem.type] === ownedItem.key;
            const viewOptions = this.viewOptions[klass];
            const firstRender = viewOptions.firstRender;
            const itemsInFirstPosition = viewOptions.itemsInFirstPosition;

            // Render selected items in first postion only for the first render
            if (itemsInFirstPosition.indexOf(ownedItem.key) !== -1 && firstRender === false) {
              gearItemsByClass[klass].unshift(ownedItem);
            } else if (isEquipped === true && firstRender === true) {
              gearItemsByClass[klass].unshift(ownedItem);
              itemsInFirstPosition.push(ownedItem.key);
            } else {
              gearItemsByClass[klass].push(ownedItem);
            }
          }
        }
      });

      each(this.gearClassesToStrings, (string, klass) => {
        this.viewOptions[klass].firstRender = false;
      });

      return gearItemsByClass;
    },
    groups () {
      return this.groupBy === 'type' ? this.gearTypesToStrings : this.gearClassesToStrings;
    },
    items () {
      return this.groupBy === 'type' ? this.gearItemsByType : this.gearItemsByClass;
    },
    itemsGroups () {
      return map(this.groups, (label, group) => {
        this.$set(this.viewOptions, group, {
          selected: true,
          open: false,
          itemsInFirstPosition: [],
          firstRender: true,
        });

        return {
          key: group,
          label,
        };
      });
    },
  },
};
</script>
