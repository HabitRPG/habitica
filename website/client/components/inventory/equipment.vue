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

    div(
      v-for="group in itemsGroups", 
      :key="group.key",
      v-if="group && viewOptions[group.key].selected",
    )
      h2
       | {{ $t(group.label) }}
       |
       span.badge.badge-pill.badge-default {{group.items.length}}

      .items
        item(
          v-for="(item, index) in group.items",
          :key="item.key",
          :item="item",
          v-if="viewOptions[group.key].open || index < 9",
        )
      div(v-if="group.items.length === 0")
        span No items in this category
      a.btn.btn-show-more(v-else, @click="viewOptions[group.key].open = !viewOptions[group.key].open") 
       | {{ viewOptions[group.key].open ? 'Close' : 'Open' }}
</template>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import map from 'lodash/map';
import Item from 'client/components/inventory/item';

export default {
  components: {
    Item,
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
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
    }),
    gearItemsByType () {
      const owned = this.user.items.gear.owned;
      const gearItemsByType = {};

      each(owned, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.content.gear.flat[gearKey];
          if (ownedItem.klass !== 'base') {
            if (!gearItemsByType[ownedItem.type]) gearItemsByType[ownedItem.type] = [];
            gearItemsByType[ownedItem.type].push(ownedItem);
          }
        }
      });

      return gearItemsByType;
    },
    gearItemsByClass () {
      const owned = this.user.items.gear.owned;
      const gearItemsByClass = {};

      each(owned, (isOwned, gearKey) => {
        if (isOwned === true) {
          const ownedItem = this.content.gear.flat[gearKey];
          if (!gearItemsByClass[ownedItem.klass]) gearItemsByClass[ownedItem.klass] = [];
          gearItemsByClass[ownedItem.klass].push(ownedItem);
        }
      });

      return gearItemsByClass;
    },
    itemsGroups () {
      const allGroups = this.groupBy === 'type' ? this.gearTypesToStrings : this.gearClassesToStrings;
      const items = this.groupBy === 'type' ? this.gearItemsByType : this.gearItemsByClass;

      return map(allGroups, (label, group) => {
        this.$set(this.viewOptions, group, {
          selected: true,
          open: false,
        });

        return {
          key: group,
          label,
          items: items[group] || [],
        };
      });
    },
  },
};
</script>
