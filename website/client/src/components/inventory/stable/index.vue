<template>
  <div
    v-mousePosition="30"
    class="row stable"
    @mouseMoved="mouseMoved($event)"
  >
    <div class="standard-sidebar d-none d-sm-block">
      <filter-sidebar>
        <div slot="header">
          <div
            id="npmMattStable"
            :class="npcClass('matt')"
          ></div>
          <b-popover
            triggers="hover"
            placement="right"
            target="npmMattStable"
          >
            <h4
              v-once
              class="popover-content-title"
            >
              {{ $t('mattBoch') }}
            </h4>
            <div
              v-once
              class="popover-content-text"
            >
              {{ $t('mattBochText1') }}
            </div>
          </b-popover>
        </div>
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

        <filter-group :title="$t('pets')">
          <div class="form-group">
            <div
              v-for="petGroup in petGroups"
              :key="petGroup.key"
              class="form-check"
            >
              <div class="custom-control custom-checkbox">
                <input
                  :id="petGroup.key"
                  v-model="viewOptions[petGroup.key].selected"
                  class="custom-control-input"
                  type="checkbox"
                  :disabled="viewOptions[petGroup.key].animalCount == 0"
                >
                <label
                  v-once
                  class="custom-control-label"
                  :for="petGroup.key"
                >{{ petGroup.label }}</label>
              </div>
            </div>
          </div>
        </filter-group>
        <filter-group :title="$t('mounts')">
          <div class="form-group">
            <div
              v-for="mountGroup in mountGroups"
              :key="mountGroup.key"
              class="form-check"
            >
              <div class="custom-control custom-checkbox">
                <input
                  :id="mountGroup.key"
                  v-model="viewOptions[mountGroup.key].selected"
                  class="custom-control-input"
                  type="checkbox"
                  :disabled="viewOptions[mountGroup.key].animalCount == 0"
                >
                <label
                  v-once
                  class="custom-control-label"
                  :for="mountGroup.key"
                >{{ mountGroup.label }}</label>
              </div>
            </div>
          </div>
        </filter-group>

        <div class="form-group clearfix">
          <h3 class="float-left">
            {{ $t('hideMissing') }}
          </h3>
          <toggle-switch
            class="float-right"
            :checked="hideMissing"
            @change="updateHideMissing"
          />
        </div>
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="clearfix">
        <h1
          v-once
          class="float-left mb-4 page-header"
        >
          {{ $t('stable') }}
        </h1>
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <select-translated-array
            :right="true"
            :items="sortByItems"
            :value="selectedSortBy"
            class="inline"
            :inline-dropdown="false"
            @select="selectedSortBy = $event"
          />
        </div>
      </div>
      <h2 class="mb-3">
        {{ $t('pets') }}
        <span
          class="badge badge-pill badge-default"
        >{{ countOwnedAnimals(petGroups[0], 'pet') }}</span>
      </h2>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="(petGroup) in petGroups"
        v-if="!anyFilterSelected || viewOptions[petGroup.key].selected"
        :key="petGroup.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h4 v-if="viewOptions[petGroup.key].animalCount !== 0">
          {{ petGroup.label }}
        </h4>
        <!-- eslint-disable vue/no-use-v-if-with-v-for, max-len -->
        <div
          v-for="(group, key, index) in pets(petGroup, hideMissing, selectedSortBy, searchTextThrottled)"
          v-if="index === 0 || $_openedItemRows_isToggled(petGroup.key)"
          :key="key"
          class="pet-row d-flex"
        >
          <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          <div
            v-for="item in group"
            v-show="show('pet', item)"
            :key="item.key"
            v-drag.drop.food="item.key"
            class="pet-group"
            :class="{'last': item.isLastInRow}"
            @itemDragOver="onDragOver($event, item)"
            @itemDropped="onDrop($event, item)"
            @itemDragLeave="onDragLeave()"
          >
            <petItem
              :item="item"
              :popover-position="'top'"
              :show-popover="currentDraggingFood == null"
              :highlight-border="highlightPet == item.key"
              @click="petClicked(item)"
            >
              <template
                slot="itemBadge"
                slot-scope="context"
              >
                <equip-badge
                  :equipped="context.item.key === currentPet"
                  :show="isOwned('pet', context.item)"
                  @click="selectPet(context.item)"
                />
              </template>
            </petItem>
          </div>
        </div>
        <show-more-button
          v-if="petRowCount[petGroup.key] > 1 && petGroup.key !== 'specialPets' && !(petGroup.key === 'wackyPets' && selectedSortBy !== 'sortByColor')"
          :show-all="$_openedItemRows_isToggled(petGroup.key)"
          class="show-more-button"
          @click="setShowMore(petGroup.key)"
        />
      </div>
      <h2>
        {{ $t('mounts') }}
        <span
          class="badge badge-pill badge-default"
        >{{ countOwnedAnimals(mountGroups[0], 'mount') }}</span>
      </h2>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="mountGroup in mountGroups"
        v-if="!anyFilterSelected || viewOptions[mountGroup.key].selected"
        :key="mountGroup.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h4 v-if="viewOptions[mountGroup.key].animalCount != 0">
          {{ mountGroup.label }}
        </h4>
        <!-- eslint-disable vue/no-use-v-if-with-v-for, max-len -->
        <div
          v-for="(group, key, index) in mounts(mountGroup, hideMissing, selectedSortBy, searchTextThrottled)"
          v-if="index === 0 || $_openedItemRows_isToggled(mountGroup.key)"
          :key="key"
          class="pet-row d-flex"
        >
          <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          <div
            v-for="item in group"
            v-show="show('mount', item)"
            :key="item.key"
            class="pet-group"
          >
            <mountItem
              :key="item.key"
              :item="item"
              :popover-position="'top'"
              :show-popover="true"
              @click="selectMount(item)"
            >
              <span slot="popoverContent">
                <h4 class="popover-content-title">{{ item.name }}</h4>
              </span>
              <template
                slot="itemBadge"
              >
                <equip-badge
                  :equipped="item.key === currentMount"
                  :show="isOwned('mount', item)"
                  @click="selectMount(item)"
                />
              </template>
            </mountItem>
          </div>
        </div>
        <show-more-button
          v-if="mountRowCount[mountGroup.key] > 1 && mountGroup.key !== 'specialMounts'"
          :show-all="$_openedItemRows_isToggled(mountGroup.key)"
          @click="setShowMore(mountGroup.key)"
        />
      </div>
      <inventoryDrawer>
        <template
          slot="item"
          slot-scope="ctx"
        >
          <foodItem
            :item="ctx.item"
            :item-count="ctx.itemCount"
            :item-content-class="ctx.itemClass"
            :active="currentDraggingFood === ctx.item"
            @itemDragEnd="onDragEnd()"
            @itemDragStart="onDragStart($event, ctx.item)"
            @itemClick="onFoodClicked($event, ctx.item)"
          />
        </template>
      </inventoryDrawer>
    </div>
    <hatchedPetDialog :hide-text="true" />
    <div
      ref="dragginFoodInfo"
      class="foodInfo"
    >
      <div v-if="currentDraggingFood != null">
        <div
          class="food-icon"
          :class="'Pet_Food_'+currentDraggingFood.key"
        ></div>
        <div class="popover">
          <div
            class="popover-content"
          >
            {{ $t('dragThisFood', {foodName: currentDraggingFood.text() }) }}
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="foodClickMode"
      ref="clickFoodInfo"
      class="foodInfo mouse"
    >
      <div v-if="currentDraggingFood != null">
        <div
          class="food-icon"
          :class="'Pet_Food_'+currentDraggingFood.key"
        ></div>
        <div class="popover">
          <div
            class="popover-content"
          >
            {{ $t('clickOnPetToFeed', {foodName: currentDraggingFood.text() }) }}
          </div>
        </div>
      </div>
    </div>
    <mount-raised-modal />
    <welcome-modal />
    <hatching-modal :hatchable-pet.sync="hatchablePet" />
  </div>
</template>

<style lang='scss' scoped>
  .group {
    height: 130px;
    overflow: hidden;
  }

  .pet-row {
    max-width: 100%;
    flex-wrap: wrap;

    .item {
      margin-right: .5em;
    }
  }
</style>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

  .inventory-item-container {
    padding: 20px;
    border: 1px solid;
    display: inline-block;
  }

  .GreyedOut {
    opacity: 0.3;
  }

  .item.item-empty {
    background-color: #edecee;
  }

  .npc_matt {
    margin-bottom: 17px;
  }

  .stable {

    .standard-page {
      padding-right:0;
    }

    .standard-page .clearfix .float-right {
      margin-right: 24px;
    }

    .svg-icon.inline.icon-16 {
      vertical-align: bottom;
    }
  }

  .last {
    margin-right: 0 !important;
  }

  .no-focus:focus {
    background-color: inherit;
    color: inherit;
  }

  .popover-content-text {
    margin-bottom: 0;
  }

  .foodInfo {
    position: absolute;
    left: -500px;

    z-index: 1080;

    &.mouse {
      position: fixed;
      pointer-events: none
    }

    .food-icon {
      margin: 0 auto 8px;
      transform: scale(1.5);
    }

    .popover {
      position: inherit;
      width: 180px;
    }

    .popover-content {
      color: white;
      margin: 15px;
      text-align: center;
    }
  }

  .hatchablePopover {
    width: 180px;

    .potionEggGroup {
      margin: 10px auto 0;
    }

    .potionEggBackground {
      display: inline-flex;
      align-items: center;

      width: 64px;
      height: 64px;
      border-radius: 2px;
      background-color: #4e4a57;

      &:first-child {
        margin-right: 24px;
      }

      div {
        margin: 0 auto;
      }
    }
  }
</style>

<script>

import _each from 'lodash/each';
import _sortBy from 'lodash/sortBy';
import _filter from 'lodash/filter';
import _throttle from 'lodash/throttle';
import groupBy from 'lodash/groupBy';
import { mapState } from '@/libs/store';

import PetItem from './petItem';
import MountItem from './mountItem.vue';
import FoodItem from './foodItem';
import HatchedPetDialog from './hatchedPetDialog';
import MountRaisedModal from './mountRaisedModal';
import WelcomeModal from './welcomeModal';
import HatchingModal from './hatchingModal';
import toggleSwitch from '@/components/ui/toggleSwitch';
import InventoryDrawer from '@/components/shared/inventoryDrawer';

import ResizeDirective from '@/directives/resize.directive';
import DragDropDirective from '@/directives/dragdrop.directive';
import MouseMoveDirective from '@/directives/mouseposition.directive';

import { createAnimal } from '@/libs/createAnimal';

import svgInformation from '@/assets/svg/information.svg';

import notifications from '@/mixins/notifications';
import openedItemRowsMixin from '@/mixins/openedItemRows';
import petMixin from '@/mixins/petMixin';
import seasonalNPC from '@/mixins/seasonalNPC';

import { CONSTANTS, setLocalSetting, getLocalSetting } from '@/libs/userlocalManager';
import { isOwned } from '../../../libs/createAnimal';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';
import ShowMoreButton from '@/components/ui/showMoreButton';
import EquipBadge from '@/components/ui/equipBadge';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';

// TODO Normalize special pets and mounts
// import Store from '@/store';
// import deepFreeze from '@/libs/deepFreeze';
// const specialMounts =

let lastMouseMoveEvent = {};

export default {
  components: {
    SelectTranslatedArray,
    EquipBadge,
    ShowMoreButton,
    FilterGroup,
    FilterSidebar,
    PetItem,
    FoodItem,
    MountItem,
    toggleSwitch,
    HatchedPetDialog,
    MountRaisedModal,
    WelcomeModal,
    HatchingModal,
    InventoryDrawer,
  },
  directives: {
    resize: ResizeDirective,
    drag: DragDropDirective,
    mousePosition: MouseMoveDirective,
  },
  mixins: [notifications, openedItemRowsMixin, petMixin, seasonalNPC],
  data () {
    const stableSortState = getLocalSetting(CONSTANTS.keyConstants.STABLE_SORT_STATE) || 'standard';

    return {
      viewOptions: {},
      hideMissing: false,
      searchText: null,
      searchTextThrottled: '',
      // sort has the translation-keys as values
      selectedSortBy: stableSortState,
      sortByItems: [
        'standard',
        'AZ',
        'sortByColor',
        'sortByHatchable',
      ],
      icons: Object.freeze({
        information: svgInformation,
      }),

      highlightPet: '',

      hatchablePet: null,
      foodClickMode: false,
      currentDraggingFood: null,

      selectedDrawerTab: 0,

      petRowCount: {},
      mountRowCount: {},
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      currentPet: 'user.data.items.currentPet',
      currentMount: 'user.data.items.currentMount',
      userItems: 'user.data.items',
      user: 'user.data',
    }),
    petGroups () {
      const petGroups = [
        {
          label: this.$t('filterByStandard'),
          key: 'standardPets',
          petSource: {
            eggs: this.content.dropEggs,
            potions: this.content.dropHatchingPotions,
          },
        },
        {
          label: this.$t('filterByMagicPotion'),
          key: 'magicPets',
          petSource: {
            eggs: this.content.dropEggs,
            potions: this.content.premiumHatchingPotions,
          },
        },
        {
          label: this.$t('filterByQuest'),
          key: 'questPets',
          petSource: {
            eggs: this.content.questEggs,
            potions: this.content.dropHatchingPotions,
          },
        },
        {
          label: this.$t('filterByWacky'),
          key: 'wackyPets',
          petSource: {
            eggs: this.content.dropEggs,
            potions: this.content.wackyHatchingPotions,
          },
        },
        {
          label: this.$t('special'),
          key: 'specialPets',
          petSource: {
            special: this.content.specialPets,
          },
        },
      ];

      petGroups.forEach(petGroup => {
        this.$set(this.viewOptions, petGroup.key, {
          selected: false,
          animalCount: 0,
        });
      });

      return petGroups;
    },
    mountGroups () {
      const mountGroups = [
        {
          label: this.$t('filterByStandard'),
          key: 'standardMounts',
          petSource: {
            eggs: this.content.dropEggs,
            potions: this.content.dropHatchingPotions,
          },
        },
        {
          label: this.$t('filterByMagicPotion'),
          key: 'magicMounts',
          petSource: {
            eggs: this.content.dropEggs,
            potions: this.content.premiumHatchingPotions,
          },
        },
        {
          label: this.$t('filterByQuest'),
          key: 'questMounts',
          petSource: {
            eggs: this.content.questEggs,
            potions: this.content.dropHatchingPotions,
          },
        },
        {
          label: this.$t('special'),
          key: 'specialMounts',
          petSource: {
            special: this.content.specialMounts,
          },
        },
      ];

      mountGroups.forEach(mountGroup => {
        this.$set(this.viewOptions, mountGroup.key, {
          selected: false,
          animalCount: 0,
        });
      });

      return mountGroups;
    },
    drawerTabs () {
      return [
        {
          label: this.$t('foodTitle'),
          items: _filter(this.content.food, f => f.key !== 'Saddle' && this.userItems.food[f.key]),
        },
        {
          label: this.$t('special'),
          items: _filter(this.content.food, f => f.key === 'Saddle' && this.userItems.food[f.key]),
        },
      ];
    },
    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
  },
  watch: {
    searchText: _throttle(function throttleSearch () {
      const search = this.searchText.toLowerCase();
      this.searchTextThrottled = search;
    }, 250),
    selectedSortBy: {
      handler () {
        setLocalSetting(CONSTANTS.keyConstants.STABLE_SORT_STATE, this.selectedSortBy);
      },
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('stable'),
      section: this.$t('inventory'),
    });
  },
  methods: {
    setShowMore (key) {
      this.$_openedItemRows_toggleByType(key, !this.$_openedItemRows_isToggled(key));
    },
    show (type, item) {
      return item.canFind === undefined
        || isOwned(type, item, this.userItems)
        || item.canFind;
    },
    getAnimalList (animalGroup, type) {
      const { key } = animalGroup;

      this.cachedAnimalList = this.cachedAnimalList || {};
      if (this.cachedAnimalList[key]) {
        return this.cachedAnimalList[key];
      }

      const animals = [];
      const { userItems } = this;

      switch (key) {
        case 'specialPets':
        case 'specialMounts': {
          _each(animalGroup.petSource.special, (value, specialKey) => {
            const eggKey = specialKey.split('-')[0];
            const potionKey = specialKey.split('-')[1];

            const { canFind, text } = this.content[`${type}Info`][specialKey];

            animals.push({
              key: specialKey,
              eggKey,
              potionKey,
              name: text(),
              canFind,
              isOwned () {
                return isOwned(type, this, userItems);
              },
              mountOwned () {
                return isOwned('mount', this, userItems);
              },
              isAllowedToFeed () {
                return type === 'pet' && this.isOwned() && !this.mountOwned();
              },
              isHatchable () {
                return false;
              },
            });
          });
          break;
        }

        default: {
          _each(animalGroup.petSource.eggs, egg => {
            _each(animalGroup.petSource.potions, potion => {
              animals.push(createAnimal(egg, potion, type, this.content, userItems));
            });
          });
        }
      }

      this.cachedAnimalList[key] = animals;

      return animals;
    },
    listAnimals (animalGroup, type, hideMissing, sort, searchText) {
      let animals = this.getAnimalList(animalGroup, type);
      const isPetList = type === 'pet';

      // 1. Filter
      if (hideMissing) {
        animals = _filter(animals, a => a.isOwned());
      }

      if (searchText && searchText !== '') {
        animals = _filter(animals, a => a.name.toLowerCase().indexOf(searchText) !== -1);
      }

      // 2. Sort
      switch (sort) { // eslint-disable-line default-case
        case 'AZ':
          animals = _sortBy(animals, ['eggName']);
          break;

        case 'sortByColor':
          animals = _sortBy(animals, ['potionName']);
          break;

        case 'sortByHatchable': {
          if (isPetList) {
            const sortFunc = i => (i.isHatchable() ? 0 : 1);
            animals = _sortBy(animals, [sortFunc]);
          }
          break;
        }
      }

      this.viewOptions[animalGroup.key].animalCount = animals.length;

      return animals;
    },
    countOwnedAnimals (animalGroup, type) {
      const animals = this.getAnimalList(animalGroup, type);

      const countAll = animals.length;
      // when counting pets, include those that have been raised into mounts
      const countOwned = _filter(animals, a => a.isOwned() || a.mountOwned());

      return `${countOwned.length}/${countAll}`;
    },
    pets (animalGroup, hideMissing, sortBy, searchText) {
      const pets = this.listAnimals(animalGroup, 'pet', hideMissing, sortBy, searchText);

      // Don't group special, no 'show more' button either
      if (animalGroup.key === 'specialPets' || (animalGroup.key === 'wackyPets' && sortBy !== 'sortByColor')) {
        this.petRowCount[animalGroup.key] = 1;
        return { none: pets };
      }

      let groupKey = 'eggKey';
      if (sortBy === 'sortByColor') {
        groupKey = 'potionKey';
      } else if (sortBy === 'AZ') {
        groupKey = i => i.eggName[0];
      } else if (sortBy === 'sortByHatchable') {
        groupKey = i => (i.isHatchable() ? 0 : 1);
      }
      const groupedPets = groupBy(pets, groupKey);

      // Pets are rendered as grouped "rows". Count helps decide if show more button is necessary.
      this.petRowCount[animalGroup.key] = Object.keys(groupedPets).length;

      return groupedPets;
    },
    mounts (animalGroup, hideMissing, sortBy, searchText) {
      const mounts = this.listAnimals(animalGroup, 'mount', hideMissing, sortBy, searchText);

      // Don't group special
      if (animalGroup.key === 'specialMounts') {
        this.mountRowCount[animalGroup.key] = 1;
        return { none: mounts };
      }

      let groupKey = 'eggKey';
      if (sortBy === 'sortByColor') {
        groupKey = 'potionKey';
      } else if (sortBy === 'AZ') {
        groupKey = i => i.eggName[0];
      }
      const groupedMounts = groupBy(mounts, groupKey);

      this.mountRowCount[animalGroup.key] = Object.keys(groupedMounts).length;

      return groupedMounts;
    },
    // Actions
    updateHideMissing (newVal) {
      this.hideMissing = newVal;
    },
    selectPet (item) {
      this.$store.dispatch('common:equip', { key: item.key, type: 'pet' });
    },
    selectMount (item) {
      this.$store.dispatch('common:equip', { key: item.key, type: 'mount' });
    },
    onDragStart (ev, food) {
      this.currentDraggingFood = food;

      const itemRef = this.$refs.dragginFoodInfo;

      const dragEvent = ev.event;

      dragEvent.dataTransfer.setDragImage(itemRef, -20, -20);
    },
    onDragOver (ev, pet) {
      if (!pet.isAllowedToFeed()) {
        ev.dropable = false;
      } else {
        this.highlightPet = pet.key;
      }
    },
    async onDrop (ev, pet) {
      this.highlightPet = '';

      this.feedAction(pet.key, ev.draggingKey);
    },

    onDragEnd () {
      this.currentDraggingFood = null;
      this.highlightPet = '';
    },
    onDragLeave () {
      this.highlightPet = '';
    },
    isOwned (type, pet) {
      return isOwned(type, pet, this.userItems);
    },
    petClicked (pet) {
      if (this.currentDraggingFood !== null) {
        if (pet.isAllowedToFeed()) {
          // food process
          this.feedAction(pet.key, this.currentDraggingFood.key);
          this.currentDraggingFood = null;
          this.foodClickMode = false;
        }
      } else {
        if (pet.isOwned()) {
          this.selectPet(pet);
          return;
        }

        if (!pet.isHatchable()) {
          return;
        }

        if (this.user.preferences.suppressModals.hatchPet) {
          this.hatchPet(pet);
          return;
        }

        // Confirm
        this.hatchablePet = pet;
        this.$root.$emit('bv::show::modal', 'hatching-modal');
      }
    },
    async feedAction (petKey, foodKey) {
      try {
        const result = await this.$store.dispatch('common:feed', { pet: petKey, food: foodKey });

        if (result.message) this.text(result.message);
        if (this.user.preferences.suppressModals.raisePet) return;
        if (this.user.items.pets[petKey] === -1) this.$root.$emit('habitica::mount-raised', petKey);
      } catch (e) {
        const errorMessage = e.message || e;

        this.$store.dispatch('snackbars:add', {
          title: 'Habitica',
          text: errorMessage,
          type: 'error',
          timeout: true,
        });
      }
    },
    onFoodClicked ($event, food) {
      if (this.currentDraggingFood === null || this.currentDraggingFood !== food) {
        this.currentDraggingFood = food;
        this.foodClickMode = true;

        this.$nextTick(() => {
          this.mouseMoved(lastMouseMoveEvent);
        });
      } else {
        this.currentDraggingFood = null;
        this.foodClickMode = false;
      }
    },
    mouseMoved ($event) {
      // Keep track of the last mouse position even in click mode so that we
      // know where to position the dragged food icon on click.
      lastMouseMoveEvent = $event;
      if (this.foodClickMode) {
        this.$refs.clickFoodInfo.style.left = `${$event.x - 70}px`;
        this.$refs.clickFoodInfo.style.top = `${$event.y}px`;
      }
    },
  },
};
</script>
