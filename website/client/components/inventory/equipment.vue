<template lang="pug">
.row
  .col-2.standard-sidebar
    .form-group
      input.form-control(type="text", :placeholder="$t('search')")

    .form
      h2(v-once) {{ $t('filter') }}
      .form-group
        .form-check(
          v-for="group in itemsGroups", 
          :key="group.key",
          v-if="group",
        )
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t(group.label) }}

  .col-10.standard-page
    h1(v-once) {{ $t('equipment') }}
    .form-check.form-check-inline
      label.form-check-label
        input.form-check-input(type='radio', v-model='groupBy', value='type')
        | Group by type
    .form-check.form-check-inline
      label.form-check-label
        input.form-check-input(type='radio', v-model='groupBy', value='class')
        | Group by class

    div(
      v-for="group in itemsGroups", 
      :key="group.key",
      v-if="group",
    )
      h2(v-once) {{ $t(group.label) }}
      div(v-for="item in group.items", :key="item.key")
        span(v-once) {{ item.text() }}
</template>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import map from 'lodash/map';

export default {
  data () {
    return {
      groupBy: 'type', // or 'class' TODO move to router?
      gearTypesToStrings: {
        headAccessory: 'headAccessoryCapitalized',
        head: 'headgearCapitalized',
        eyewear: 'eyewear',
        weapon: 'weaponCapitalized',
        shield: 'offhandCapitalized',
        armor: 'armorCapitalized',
        body: 'body',
        back: 'back',
      },
      gearClassesToStrings: {
        warrior: 'warrior',
        wizard: 'mage',
        rogue: 'rogue',
        healer: 'healer',
        special: 'special',
        mystery: 'mystery',
        armoire: 'armoireText',
      },
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
        const itemsOfGroup = items[group];
        const hasItemsOfGroup = Boolean(itemsOfGroup);
        if (hasItemsOfGroup) {
          return {
            key: group,
            label,
            items: itemsOfGroup,
          };
        } else {
          return null;
        }
      });
    },
  },
};
</script>
