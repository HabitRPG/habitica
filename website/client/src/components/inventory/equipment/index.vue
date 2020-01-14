<template>
  <div class="row">
    <div class="standard-sidebar d-none d-sm-block">
      <div class="form-group">
        <input
          v-model="searchText"
          class="form-control input-search"
          type="text"
          :placeholder="$t('search')"
        >
      </div>
      <div class="form">
        <h2 v-once>
          {{ $t('filter') }}
        </h2>
        <h3>{{ groupBy === 'type' ? $t('equipmentType') : $t('class') }}</h3>
        <div class="form-group">
          <div
            v-for="group in itemsGroups"
            :key="group.key"
            class="form-check"
          >
            <div class="custom-control custom-checkbox">
              <input
                :id="groupBy + group.key"
                v-model="viewOptions[group.key].selected"
                class="custom-control-input"
                type="checkbox"
              >
              <label
                v-once
                class="custom-control-label"
                :for="groupBy + group.key"
              >{{ group.label }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="standard-page">
      <div class="clearfix">
        <h1
          v-once
          class="float-left mb-4 page-header"
        >
          {{ $t('equipment') }}
        </h1>
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <b-dropdown
            :text="$t(selectedSortGearBy)"
            right="right"
          >
            <b-dropdown-item
              v-for="sort in sortGearBy"
              :key="sort"
              :active="selectedSortGearBy === sort"
              @click="selectedSortGearBy = sort"
            >
              {{ $t(sort) }}
            </b-dropdown-item>
          </b-dropdown>
          <span class="dropdown-label">{{ $t('groupBy2') }}</span>
          <b-dropdown
            :text="$t(groupBy === 'type' ? 'equipmentType' : 'class')"
            right="right"
          >
            <b-dropdown-item
              :active="groupBy === 'type'"
              @click="groupBy = 'type'"
            >
              {{ $t('equipmentType') }}
            </b-dropdown-item>
            <b-dropdown-item
              :active="groupBy === 'class'"
              @click="groupBy = 'class'"
            >
              {{ $t('class') }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <drawer
        :title="$t('equipment')"
        :error-message="(costumeMode && !user.preferences.costume) ? $t('costumeDisabled') : null"
        :open-status="openStatus"
        @toggled="drawerToggled"
      >
        <div slot="drawer-header">
          <div class="drawer-tab-container">
            <div class="drawer-tab text-right">
              <a
                class="drawer-tab-text"
                :class="{'drawer-tab-text-active': !costumeMode}"
                @click="selectDrawerTab('equipment')"
              >{{ $t('equipment') }}</a>
            </div>
            <div class="clearfix">
              <div class="drawer-tab float-left">
                <a
                  class="drawer-tab-text"
                  :class="{'drawer-tab-text-active': costumeMode}"
                  @click="selectDrawerTab('costume')"
                >{{ $t('costume') }}</a>
              </div>
              <toggle-switch
                class="float-right align-with-tab"
                :label="$t(costumeMode ? 'useCostume' : 'autoEquipBattleGear')"
                :checked="user.preferences[drawerPreference]"
                :hover-text="$t(drawerPreference+'PopoverText')"
                @change="changeDrawerPreference"
              />
            </div>
          </div>
        </div>
        <div
          slot="drawer-slider"
          class="items items-one-line"
        >
          <item
            v-for="(label, group) in gearTypesToStrings"
            :key="flatGear[activeItems[group]] ? flatGear[activeItems[group]].key : group"
            class="pointer"
            :item="flatGear[activeItems[group]]"
            :item-content-class="flatGear[activeItems[group]]
              ? 'shop_' + flatGear[activeItems[group]].key : null"
            :empty-item="!flatGear[activeItems[group]]
              || flatGear[activeItems[group]].key.indexOf('_base_0') !== -1"
            :label="label"
            :popover-position="'top'"
            :show-popover="flatGear[activeItems[group]]
              && Boolean(flatGear[activeItems[group]].text)"
            @click="equipItem(flatGear[activeItems[group]])"
          >
            <template
              slot="popoverContent"
              slot-scope="context"
            >
              <equipmentAttributesPopover :item="context.item" />
            </template>
            <template
              slot="itemBadge"
              slot-scope="context"
            >
              <starBadge
                :selected="true"
                :show="!costumeMode || user.preferences.costume"
                @click="equipItem(context.item)"
              />
            </template>
          </item>
        </div>
      </drawer>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="group in itemsGroups"
        v-if="!anyFilterSelected || viewOptions[group.key].selected"
        :key="group.key"
        :class="group.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h2 class="mb-3">
          {{ group.label }}
          <span
            class="badge badge-pill badge-default"
          >{{ items[group.key].length }}</span>
        </h2>
        <itemRows
          :items="sortItems(items[group.key], selectedSortGearBy)"
          :item-width="94"
          :item-margin="24"
          :type="group.key"
          :no-items-label="$t('noGearItemsOfType', { type: group.label })"
        >
          <template
            slot="item"
            slot-scope="context"
          >
            <item
              :key="context.item.key"
              :item="context.item"
              :item-content-class="'shop_' + context.item.key"
              :empty-item="!context.item || context.item.key.indexOf('_base_0') !== -1"
              @click="openEquipDialog(context.item)"
            >
              <template
                slot="itemBadge"
                slot-scope="context"
              >
                <starBadge
                  :selected="activeItems[context.item.type] === context.item.key"
                  :show="!costumeMode || user.preferences.costume"
                  @click="equipItem(context.item)"
                />
              </template>
              <template
                slot="popoverContent"
                slot-scope="context"
              >
                <equipmentAttributesPopover :item="context.item" />
              </template>
            </item>
          </template>
        </itemRows>
      </div>
    </div>
    <equipGearModal
      :item="gearToEquip"
      :costume-mode="costumeMode"
      :is-equipped="gearToEquip == null ? false : activeItems[gearToEquip.type] === gearToEquip.key"
      @equipItem="equipItem($event)"
      @change="changeModalState($event)"
    />
  </div>
</template>

<style lang="scss">
.pointer {
  cursor: pointer;
}

.align-with-tab {
  margin-top: 3px;
}

.drawer-tab-text {
  display: inline-block;
}
</style>

<script>

import each from 'lodash/each';
import map from 'lodash/map';
import throttle from 'lodash/throttle';
import _sortBy from 'lodash/sortBy';
import _reverse from 'lodash/reverse';
import { CONSTANTS, setLocalSetting, getLocalSetting } from '@/libs/userlocalManager';
import { mapState } from '@/libs/store';

import toggleSwitch from '@/components/ui/toggleSwitch';
import Item from '@/components/inventory/item';
import ItemRows from '@/components/ui/itemRows';
import EquipmentAttributesPopover from '@/components/inventory/equipment/attributesPopover';
import StarBadge from '@/components/ui/starBadge';
import Drawer from '@/components/ui/drawer';

import i18n from '@/../../common/script/i18n';

import EquipGearModal from './equipGearModal';

const sortGearTypes = ['sortByName', 'sortByCon', 'sortByPer', 'sortByStr', 'sortByInt'];

const sortGearTypeMap = {
  sortByName: i => i.text(),
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
      costumeMode: false,
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
      return this.costumeMode ? 'costume' : 'autoEquip';
    },
    activeItems () {
      return this.costumeMode ? this.costumeItems : this.equippedItems;
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

          const isSearched = !searchText
            || ownedItem.text().toLowerCase().indexOf(searchText) !== -1;

          if (ownedItem.klass !== 'base' && isSearched) {
            const { type } = ownedItem;
            const isEquipped = this.activeItems[type] === ownedItem.key;
            const viewOptions = this.viewOptions[type];
            const { firstRender } = viewOptions;
            const { itemsInFirstPosition } = viewOptions;

            // Render selected items in first position only for the first render
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
        this.viewOptions[type].firstRender = false; // eslint-disable-line vue/no-side-effects-in-computed-properties, max-len
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
          const { klass } = ownedItem;

          const isSearched = !searchText
            || ownedItem.text().toLowerCase().indexOf(searchText) !== -1;

          if (klass !== 'base' && isSearched) {
            const isEquipped = this.activeItems[ownedItem.type] === ownedItem.key;
            const viewOptions = this.viewOptions[klass];
            const { firstRender } = viewOptions;
            const { itemsInFirstPosition } = viewOptions;

            // Render selected items in first position only for the first render
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
        this.viewOptions[klass].firstRender = false; // eslint-disable-line vue/no-side-effects-in-computed-properties, max-len
      });

      return gearItemsByClass;
    },
    groups () {
      return this.groupBy === 'type' ? this.gearTypesToStrings : this.gearClassesToStrings;
    },
    items () {
      return this.groupBy === 'type' ? this.gearItemsByType : this.gearItemsByClass;
    },
    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
    itemsGroups () {
      return map(this.groups, (label, group) => {
        this.$set(this.viewOptions, group, {
          selected: false,
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
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    const drawerState = getLocalSetting(CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE);
    if (drawerState === CONSTANTS.drawerStateValues.DRAWER_CLOSED) {
      this.$store.state.equipmentDrawerOpen = false;
    }

    this.costumeMode = getLocalSetting(
      CONSTANTS.keyConstants.CURRENT_EQUIPMENT_DRAWER_TAB,
    ) === CONSTANTS.equipmentDrawerTabValues.COSTUME_TAB;
  },
  methods: {
    selectDrawerTab (tabName) {
      let tabNameValue;
      if (tabName === 'costume') {
        tabNameValue = CONSTANTS.equipmentDrawerTabValues.COSTUME_TAB;
        this.costumeMode = true;
      } else {
        tabNameValue = CONSTANTS.equipmentDrawerTabValues.EQUIPMENT_TAB;
        this.costumeMode = false;
      }
      setLocalSetting(CONSTANTS.keyConstants.CURRENT_EQUIPMENT_DRAWER_TAB, tabNameValue);
    },
    openEquipDialog (item) {
      this.gearToEquip = item;
    },
    changeModalState (visible) {
      if (!visible) {
        this.gearToEquip = null;
      }
    },
    equipItem (item) {
      this.$store.dispatch('common:equip', { key: item.key, type: this.costumeMode ? 'costume' : 'equipped' });
      this.gearToEquip = null;
    },
    changeDrawerPreference (newVal) {
      this.$store.dispatch('user:set', {
        [`preferences.${this.drawerPreference}`]: newVal,
      });
    },
    sortItems (items, sortBy) {
      const userClass = this.user.stats.class;

      return sortBy === 'sortByName'
        ? _sortBy(items, sortGearTypeMap[sortBy])
        : _reverse(_sortBy(items, item => {
          const attrToSort = sortGearTypeMap[sortBy];
          let attrValue = item[attrToSort];
          if (item.klass === userClass || item.specialClass === userClass) {
            attrValue *= 1.5;
          }

          return attrValue;
        }));
    },
    drawerToggled (newState) {
      this.$store.state.equipmentDrawerOpen = newState;

      if (newState) {
        setLocalSetting(
          CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE,
          CONSTANTS.drawerStateValues.DRAWER_OPEN,
        );
        return;
      }

      setLocalSetting(
        CONSTANTS.keyConstants.EQUIPMENT_DRAWER_STATE,
        CONSTANTS.drawerStateValues.DRAWER_CLOSED,
      );
    },
  },
};
</script>
