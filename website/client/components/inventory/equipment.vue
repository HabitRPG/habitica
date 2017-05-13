<template lang="pug">
.row
  .col-2.standard-sidebar
    .form-group
      input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

    .form
      h2(v-once) {{ $t('filter') }}
      h3 {{ this.groupBy === 'type' ? 'Type' : $t('class') }}
      .form-group
        .form-check(
          v-for="group in itemsGroups", 
          :key="group.key",
        )
          label.custom-control.custom-checkbox 
            input.custom-control-input(type="checkbox", v-model="viewOptions[group.key].selected")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t(group.label) }}

  .col-10.standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('equipment') }}
      b-dropdown.float-right(text="Sort by", right=true)
        b-dropdown-item(href="#") Option 1
        b-dropdown-item(href="#") Option 2
        b-dropdown-item(href="#") Option 3
      b-dropdown.float-right(text="Group by", right=true)
        b-dropdown-item(@click="groupBy = 'type'", :class="{'dropdown-item-active': groupBy === 'type'}") Type
        b-dropdown-item(@click="groupBy = 'class'", :class="{'dropdown-item-active': groupBy === 'class'}") {{ $t('class') }}

    drawer(:title="$t('equipment')")
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
          :label="$t(label)",
          :selected="true",
          :popoverPosition="'top'",
          @click="equip",
        )
    div(
      v-for="group in itemsGroups",
      v-if="viewOptions[group.key].selected",
      :key="group.key",
    )
      h2
       | {{ $t(group.label) }}
       |
       span.badge.badge-pill.badge-default {{items[group.key].length}}

      .items
        item(
          v-for="(item, index) in items[group.key]",
          v-if="viewOptions[group.key].open || index < itemsPerLine",
          :item="item",
          :key="item.key",
          :selected="activeItems[item.type] === item.key",
          @click="equip",
        )
      div(v-if="items[group.key].length === 0")
        p(v-once) {{ $t('noGearItemsOfType', { type: $t(group.label) }) }}
      a.btn.btn-show-more(
        v-if="items[group.key].length > itemsPerLine",
        @click="viewOptions[group.key].open = !viewOptions[group.key].open"
      ) {{ viewOptions[group.key].open ? $t('showLessGearItems', { type: $t(group.label) }) : $t('showAllGearItems', { type: $t(group.label), items: items[group.key].length }) }}
</template>

<style lang="scss" scoped>
h2 {
  margin-top: 24px;
}

.standard-page {
  padding-bottom: 72px;
}
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import map from 'lodash/map';
import throttle from 'lodash/throttle';

import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import toggleSwitch from 'client/components/ui/toggleSwitch';

import Item from 'client/components/inventory/item';
import Drawer from 'client/components/inventory/drawer';

export default {
  components: {
    Item,
    Drawer,
    bDropdown,
    bDropdownItem,
    toggleSwitch,
  },
  data () {
    return {
      itemsPerLine: 9,
      searchText: null,
      searchTextThrottled: null,
      costume: false,
      groupBy: 'type', // or 'class' TODO move to router?
      gearTypesToStrings: Object.freeze({ // TODO use content.itemList?
        headAccessory: 'headAccessoryCapitalized',
        head: 'headgearCapitalized',
        eyewear: 'eyewear',
        weapon: 'weaponCapitalized',
        shield: 'offhandCapitalized',
        armor: 'armorCapitalized',
        body: 'body',
        back: 'back',
      }),
      gearClassesToStrings: Object.freeze({
        warrior: 'warrior', // TODO immediately calculate $(label) instead of all the times
        wizard: 'mage',
        rogue: 'rogue',
        healer: 'healer',
        special: 'special',
        mystery: 'mystery',
        armoire: 'armoireText',
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
