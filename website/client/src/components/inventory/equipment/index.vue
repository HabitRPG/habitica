<template>
  <div class="row">
    <div class="standard-sidebar d-none d-sm-block">
      <filter-sidebar>
        <div
          slot="search"
          class="form-group"
        >
          <input
            v-model="searchText"
            class="form-control input-search"
            type="text"
            :placeholder="$t('search')"
          >
        </div>

        <div class="form">
          <filter-group :title="groupBy === 'type' ? $t('equipmentType') : $t('class')">
            <checkbox
              v-for="group in itemsGroups"
              :id="groupBy + group.key"
              :key="group.key"
              :checked.sync="viewOptions[group.key].selected"
              :text="group.label"
            />
          </filter-group>
        </div>
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="clearfix">
        <div class="mb-4 float-left">
          <button
            class="page-header btn-flat equipment-type-button textCondensed"
            :class="{'active': !costumeMode}"
            @click="selectDrawerTab('equipment')"
          >
            {{ $t('battleGear') }}
          </button>
          <button
            class="page-header btn-flat equipment-type-button textCondensed"
            :class="{'active': costumeMode}"
            @click="selectDrawerTab('costume')"
          >
            {{ $t('costume') }}
          </button>
        </div>

        <div class="float-right top-menu">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <select-translated-array
            :right="true"
            :items="sortGearBy"
            :value="selectedSortGearBy"
            class="inline"
            :inline-dropdown="false"
            @select="selectedSortGearBy = $event"
          />

          <span class="dropdown-label">{{ $t('groupBy2') }}</span>

          <select-list
            :items="groupByItems"
            :value="groupBy"
            class="array-select"
            :right="true"
            :hide-icon="false"
            :inline-dropdown="false"
            @select="groupBy = $event"
          >
            <template v-slot:item="{ item }">
              <span class="label">{{ groupByLabel(item) }}</span>
            </template>
          </select-list>

          <span class="divider"></span>
          <unequip-dropdown />
        </div>
      </div>

      <drawer
        :no-title-bottom-padding="true"
        :error-message="(costumeMode && !user.preferences.costume) ? $t('costumeDisabled') : null"
        :open-status="openStatus"
        @toggled="drawerToggled"
      >
        <div
          slot="drawer-title-row"
          class="title-row-tabs"
        >
          <div class="drawer-tab">
            <a
              class="drawer-tab-text"
              :class="{'drawer-tab-text-active': !costumeMode}"
              @click.prevent.stop="selectDrawerTab('equipment')"
            >{{ $t('battleGear') }}</a>
          </div>
          <div class="drawer-tab">
            <a
              class="drawer-tab-text"
              :class="{'drawer-tab-text-active': costumeMode}"
              @click.prevent.stop="selectDrawerTab('costume')"
            >{{ $t('costume') }}</a>
          </div>
        </div>
        <div slot="drawer-header">
          <div class="drawer-tab-container">
            <div class="clearfix">
              <toggle-switch
                class="float-right align-with-tab"
                :label="$t(costumeMode ? 'useCostume' : 'autoEquipBattleGear')"
                :checked="user.preferences[drawerPreference]"
                :hover-text="$t(`${drawerPreference}PopoverText`)"
                @change="changeDrawerPreference"
              />
            </div>
          </div>
        </div>
        <div
          slot="drawer-slider"
          class="equipment items items-one-line"
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
            @click="openEquipDialog(flatGear[activeItems[group]])"
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
              <equip-badge
                :equipped="true"
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
        <h2 class="d-flex align-items-center mb-3">
          {{ group.label }}
          <span
            class="badge badge-pill badge-default ml-2"
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
                <equip-badge
                  :equipped="activeItems[context.item.type] === context.item.key"
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
@import '~@/assets/scss/colors.scss';

.pointer {
  cursor: pointer;
}

.align-with-tab {
  margin-top: 3px;
  margin-right: 3px;
}

.drawer-tab-text {
  display: inline-block;
}

.equipment.items .item-empty {
  background: $gray-10 !important;
}

</style>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.page-header.btn-flat {
  background: transparent;
}

.title-row-tabs {
  display: flex;
  justify-content: center;

  .drawer-tab {
    background: transparent;
  }
}

.equipment-type-button {
  height: 2rem;
  font-size: 24px;
  font-weight: bold;
  font-stretch: condensed;
  line-height: 1.33;
  letter-spacing: normal;
  color: $gray-10;

  margin-right: 1.125rem;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 2.5rem;

  &.active, &:hover {
    color: $purple-300;
    box-shadow: 0px -0.25rem 0px $purple-300 inset;
    outline: none;
  }
}

.divider {
  width: 0.063rem;
  height: 2rem;
  background-color: $gray-500;
  margin-left: 1rem;
  margin-right: 1rem;
}

.top-menu {
  display: flex;
  align-items: center;
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
import Drawer from '@/components/ui/drawer';

import i18n from '@/../../common/script/i18n';

import EquipGearModal from './equipGearModal';

import FilterGroup from '@/components/ui/filterGroup';
import FilterSidebar from '@/components/ui/filterSidebar';
import Checkbox from '@/components/ui/checkbox';
import UnequipDropdown from '@/components/inventory/equipment/unequipDropdown';
import EquipBadge from '@/components/ui/equipBadge';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import SelectList from '@/components/ui/selectList';

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
    SelectList,
    SelectTranslatedArray,
    EquipBadge,
    UnequipDropdown,
    Checkbox,
    FilterSidebar,
    FilterGroup,
    Item,
    ItemRows,
    EquipmentAttributesPopover,
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
      groupByItems: [
        'type', 'class',
      ],
      groupBy: 'type', // or 'class'
      gearTypesToStrings: Object.freeze({ // TODO use content.itemList?
        weapon: i18n.t('weaponCapitalized'),
        shield: i18n.t('offHandCapitalized'),
        head: i18n.t('headgearCapitalized'),
        armor: i18n.t('armorCapitalized'),
        headAccessory: i18n.t('headAccessory'),
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

    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('equipment'),
      section: this.$t('inventory'),
    });
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
      this.$store.state.equipmentDrawerOpen = true;
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
    groupByLabel (type) {
      switch (type) {
        case 'type': return i18n.t('equipmentType');
        case 'class': return i18n.t('class');
        default: return '';
      }
    },
  },
};
</script>
