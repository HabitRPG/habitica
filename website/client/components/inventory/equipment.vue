<template lang="pug">
.row
  .col-2.standard-sidebar
    .form-group
      input.form-control.search-control(type="text", :placeholder="$t('search')")

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
      h1.float-left(v-once) {{ $t('equipment') }}
      b-dropdown.float-right(text="Sort by", right=true)
        b-dropdown-item(href="#") Option 1
        b-dropdown-item(href="#") Option 2
        b-dropdown-item(href="#") Option 3
      b-dropdown.float-right(text="Group by", right=true)
        b-dropdown-item(@click="groupBy = 'type'", :class="{'dropdown-item-active': groupBy === 'type'}") Type
        b-dropdown-item(@click="groupBy = 'class'", :class="{'dropdown-item-active': groupBy === 'class'}") {{ $t('class') }}

    drawer(:title="$t('equipment')")
    div(
      v-for="group in itemsGroups",
      v-if="group && viewOptions[group.key].selected",
      :key="group.key",
    )
      h2
       | {{ $t(group.label) }}
       |
       span.badge.badge-pill.badge-default {{items[group.key].length}}

      .items
        item(
          v-for="(item, index) in items[group.key]",
          v-if="viewOptions[group.key].open || index < 9",
          :item="item",
          :key="item.key",
          :selected="equippedItems[item.type] === item.key",
          @click.native="equip({key: item.key, type: 'equipped'})",
        )
      div(v-if="items[group.key].length === 0")
        span No items in this category
      a.btn.btn-show-more(v-else, @click="viewOptions[group.key].open = !viewOptions[group.key].open") 
       | {{ viewOptions[group.key].open ? 'Close' : 'Open' }}
</template>

<script>
import { mapState, mapActions } from 'client/libs/store';
import each from 'lodash/each';
import map from 'lodash/map';
import Item from 'client/components/inventory/item';
import Drawer from 'client/components/inventory/drawer';

export default {
  components: {
    Item,
    Drawer,
  },
  data () {
    return {
      groupBy: 'type', // or 'class' TODO move to router?
      gearTypesToStrings: Object.freeze({
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
        warrior: 'warrior',
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
  methods: {
    ...mapActions({
      equip: 'common:equip',
    }),
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      ownedItems: 'user.data.items.gear.owned',
      equippedItems: 'user.data.items.gear.equipped',
      flatGear: 'content.gear.flat',
    }),
    gearItemsByType () {
      const gearItemsByType = {};
      each(this.gearTypesToStrings, (string, type) => {
        gearItemsByType[type] = [];
      });

      each(this.ownedItems, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.flatGear[gearKey];

          if (ownedItem.klass !== 'base') {
            const isEquipped = this.equippedItems[ownedItem.type] === ownedItem.key;

            if (isEquipped === true) { // TODO first postion only on first render
              gearItemsByType[ownedItem.type].unshift(ownedItem);
            } else {
              gearItemsByType[ownedItem.type].push(ownedItem);
            }
          }
        }
      });

      return gearItemsByType;
    },
    gearItemsByClass () {
      const gearItemsByClass = {};
      each(this.gearClassesToStrings, (string, klass) => {
        gearItemsByClass[klass] = [];
      });

      each(this.ownedItems, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.flatGear[gearKey];
          if (ownedItem.klass !== 'base') {
            const isEquipped = this.equippedItems[ownedItem.type] === ownedItem.key;

            if (isEquipped === true) { // TODO first postion only on first render
              gearItemsByClass[ownedItem.klass].unshift(ownedItem);
            } else {
              gearItemsByClass[ownedItem.klass].push(ownedItem);
            }
          }
        }
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
