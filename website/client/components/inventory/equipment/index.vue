<template lang="pug">
.row
  .standard-sidebar.d-none.d-sm-block
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
          .custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="viewOptions[group.key].selected", :id="group.key")
            label.custom-control-label(v-once, :for="group.key") {{ group.label }}

  .standard-page
    .clearfix
      h1.float-left.mb-4.page-header(v-once) {{ $t('equipment') }}
      .float-right
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t(selectedSortGearBy)", right=true)
          b-dropdown-item(
            v-for="sort in sortGearBy",
            @click="selectedSortGearBy = sort",
            :active="selectedSortGearBy === sort",
            :key="sort"
          ) {{ $t(sort) }}

        span.dropdown-label {{ $t('groupBy2') }}
        b-dropdown(:text="$t(groupBy === 'type' ? 'equipmentType' : 'class')", right=true)
          b-dropdown-item(@click="groupBy = 'type'", :active="groupBy === 'type'") {{ $t('equipmentType') }}
          b-dropdown-item(@click="groupBy = 'class'", :active="groupBy === 'class'") {{ $t('class') }}

    drawer(
      :title="$t('equipment')",
      :errorMessage="(costume && !user.preferences.costume) ? $t('costumeDisabled') : null",
      :openStatus='openStatus',
      v-on:toggled='drawerToggled'
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

            toggle-switch#costumePrefToggleSwitch.float-right(
              :label="$t(costume ? 'useCostume' : 'autoEquipBattleGear')",
              :checked="user.preferences[drawerPreference]",
              @change="changeDrawerPreference",
            )

            b-popover(
              target="costumePrefToggleSwitch"
              triggers="hover",
              placement="top"
            )
              .popover-content-text {{ $t(drawerPreference+'PopoverText') }}
      .items.items-one-line(slot="drawer-slider")
        item.pointer(
          v-for="(label, group) in gearTypesToStrings",
          :key="flatGear[activeItems[group]] ? flatGear[activeItems[group]].key : group",
          :item="flatGear[activeItems[group]]",
          :itemContentClass="flatGear[activeItems[group]] ? 'shop_' + flatGear[activeItems[group]].key : null",
          :emptyItem="!flatGear[activeItems[group]] || flatGear[activeItems[group]].key.indexOf('_base_0') !== -1",
          :label="label",
          :popoverPosition="'top'",
          :showPopover="flatGear[activeItems[group]] && Boolean(flatGear[activeItems[group]].text)",
          @click="equipItem(flatGear[activeItems[group]])",
        )
          template(slot="popoverContent", slot-scope="context")
            equipmentAttributesPopover(:item="context.item")
          template(slot="itemBadge", slot-scope="context")
            starBadge(
              :selected="true",
              :show="!costume || user.preferences.costume",
              @click="equipItem(context.item)",
            )
    div(
      v-for="group in itemsGroups",
      v-if="viewOptions[group.key].selected",
      :key="group.key",
      :class='group.key',
    )
      h2.mb-3
       | {{ group.label }}
       |
       span.badge.badge-pill.badge-default {{items[group.key].length}}

      itemRows(
        :items="sortItems(items[group.key], selectedSortGearBy)",
        :itemWidth=94,
        :itemMargin=24,
        :type="group.key",
        :noItemsLabel="$t('noGearItemsOfType', { type: group.label })"
      )
        template(slot="item", slot-scope="context")
          item(
            :item="context.item",
            :itemContentClass="'shop_' + context.item.key",
            :emptyItem="!context.item || context.item.key.indexOf('_base_0') !== -1",
            :key="context.item.key",
            @click="openEquipDialog(context.item)"
          )
            template(slot="itemBadge", slot-scope="context")
              starBadge(
                :selected="activeItems[context.item.type] === context.item.key",
                :show="!costume || user.preferences.costume",
                @click="equipItem(context.item)",
              )
            template(slot="popoverContent", slot-scope="context")
              equipmentAttributesPopover(:item="context.item")

  equipGearModal(
    :item="gearToEquip",
    @equipItem="equipItem($event)",
    @change="changeModalState($event)",
    :costumeMode="costume",
    :isEquipped="gearToEquip == null ? false : activeItems[gearToEquip.type] === gearToEquip.key"
  )
</template>

<style lang="scss">
.pointer {
  cursor: pointer;
}
</style>

<script>
import { mapState } from 'client/libs/store';
import { CONSTANTS, setLocalSetting, getLocalSetting } from 'client/libs/userlocalManager';

import each from 'lodash/each';
import map from 'lodash/map';
import throttle from 'lodash/throttle';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';

import toggleSwitch from 'client/components/ui/toggleSwitch';

import Item from 'client/components/inventory/item';
import ItemRows from 'client/components/ui/itemRows';
import EquipmentAttributesPopover from 'client/components/inventory/equipment/attributesPopover';
import StarBadge from 'client/components/ui/starBadge';
import Drawer from 'client/components/ui/drawer';

import i18n from 'common/script/i18n';

import EquipGearModal from './equipGearModal';


const sortGearTypes = ['sortByName', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'];

const sortGearTypeMap = {
  sortByName: (i) => i.text(),
  sortByCon: 'con',
  sortByPer: 'per',
  sortByStr: 'str',
  sortByInt: 'int',
};

export default {
  name: 'Equipment',
  components: {
    Item,
    ItemRows,
    EquipmentAttributesPopover,
    StarBadge,
    Drawer,
    toggleSwitch,
    EquipGearModal,
  },
  data () {
    return {
      itemsPerLine: 9,
      searchText: null,
      searchTextThrottled: null,
      costume: false,
      groupBy: 'type', // or 'class'
      gearTypesToStrings: Object.freeze({ // TODO use content.itemList?
        weapon: i18n.t('weaponCapitalized'),
        shield: i18n.t('offhandCapitalized'),
        head: i18n.t('headgearCapitalized'),
        armor: i18n.t('armorCapitalized'),
        headAccessory: i18n.t('headAccessoryCapitalized'),
        eyewear: i18n.t('eyewear'),
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
      gearToEquip: null,
      sortGearBy: sortGearTypes,
      selectedSortGearBy: 'sortByName',
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    const drawerState = getLocalSetting(CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE);
    if (drawerState === CONSTANTS.valueConstants.DRAWER_CLOSED) {
      this.$store.state.equipmentDrawerOpen = false;
    }
  },
  methods: {
    openEquipDialog (item) {
      this.gearToEquip = item;
    },
    changeModalState (visible) {
      if (!visible) {
        this.gearToEquip = null;
      }
    },
    equipItem (item) {
      this.$store.dispatch('common:equip', {key: item.key, type: this.costume ? 'costume' : 'equipped'});
      this.gearToEquip = null;
    },
    changeDrawerPreference (newVal) {
      this.$store.dispatch('user:set', {
        [`preferences.${this.drawerPreference}`]: newVal,
      });
    },
    sortItems (items, sortBy) {
      return sortBy === 'sortByName' ? _sortBy(items, sortGearTypeMap[sortBy]) : _reverse(_sortBy(items, sortGearTypeMap[sortBy]));
    },
    drawerToggled (newState) {
      this.$store.state.equipmentDrawerOpen = newState;

      if (newState) {
        setLocalSetting(CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE, CONSTANTS.valueConstants.DRAWER_OPEN);
        return;
      }

      setLocalSetting(CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE, CONSTANTS.valueConstants.DRAWER_CLOSED);
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
    openStatus () {
      return this.$store.state.equipmentDrawerOpen ? 1 : 0;
    },
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
