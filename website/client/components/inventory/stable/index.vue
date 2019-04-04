<template lang="pug">
.row.stable(v-mousePosition="30", @mouseMoved="mouseMoved($event)")
  .standard-sidebar.d-none.d-sm-block
    div
      #npmMattStable.npc_matt
      b-popover(
        triggers="hover",
        placement="right",
        target="npmMattStable"
      )
        h4.popover-content-title(v-once) {{ $t('mattBoch') }}
        .popover-content-text(v-once) {{ $t('mattBochText1') }}
    .form-group
      input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")
    .form
      h2(v-once) {{ $t('filter') }}
      h3(v-once) {{ $t('pets') }}
      .form-group
        .form-check(
          v-for="petGroup in petGroups",
          :key="petGroup.key"
        )
          .custom-control.custom-checkbox
            input.custom-control-input(
              type="checkbox",
              v-model="viewOptions[petGroup.key].selected",
              :disabled="viewOptions[petGroup.key].animalCount == 0",
              :id="petGroup.key",
            )
            label.custom-control-label(v-once, :for="petGroup.key") {{ petGroup.label }}
      h3(v-once) {{ $t('mounts') }}
      .form-group
        .form-check(
          v-for="mountGroup in mountGroups",
          :key="mountGroup.key"
        )
          .custom-control.custom-checkbox
            input.custom-control-input(
              type="checkbox",
              v-model="viewOptions[mountGroup.key].selected",
              :disabled="viewOptions[mountGroup.key].animalCount == 0",
              :id="mountGroup.key",
            )
            label.custom-control-label(v-once, :for="mountGroup.key") {{ mountGroup.label }}

      div.form-group.clearfix
        h3.float-left {{ $t('hideMissing') }}
        toggle-switch.float-right(
          :checked="hideMissing",
          @change="updateHideMissing"
        )
  .standard-page
    .clearfix
      h1.float-left.mb-4.page-header(v-once) {{ $t('stable') }}

      div.float-right
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t(selectedSortBy)", right=true)
          b-dropdown-item(
            v-for="sort in sortByItems",
            @click="selectedSortBy = sort",
            :active="selectedSortBy === sort",
            :key="sort"
          ) {{ $t(sort) }}

    h2.mb-3
      | {{ $t('pets') }}
      |
      span.badge.badge-pill.badge-default {{countOwnedAnimals(petGroups[0], 'pet')}}

    div(v-for="(petGroup, index) in petGroups",
      v-if="!anyFilterSelected || viewOptions[petGroup.key].selected",
      :key="petGroup.key")
      h4(v-if="viewOptions[petGroup.key].animalCount !== 0") {{ petGroup.label }}

      .pet-row.d-flex(
        v-for="(group, key, index) in pets(petGroup, hideMissing, selectedSortBy, searchTextThrottled)",
        v-if='index === 0 || $_openedItemRows_isToggled(petGroup.key)')
        .pet-group(
          v-for='item in group'
          v-drag.drop.food="item.key",
          @itemDragOver="onDragOver($event, item)",
          @itemDropped="onDrop($event, item)",
          @itemDragLeave="onDragLeave()",
          :class="{'last': item.isLastInRow}"
        )
          petItem(
            :item="item",
            :popoverPosition="'top'",
            :showPopover="currentDraggingFood == null",
            :highlightBorder="highlightPet == item.key",
            @click="petClicked(item)"
          )
            template(slot="itemBadge", slot-scope="context")
              starBadge(
                :selected="context.item.key === currentPet",
                :show="isOwned('pet', context.item)",
                @click="selectPet(context.item)"
              )

      .btn.btn-flat.btn-show-more(@click="setShowMore(petGroup.key)", v-if='petGroup.key !== "specialPets" && petGroup.key !== "wackyPets"')
        | {{ $_openedItemRows_isToggled(petGroup.key) ? $t('showLess') : $t('showMore') }}

    h2
      | {{ $t('mounts') }}
      |
      span.badge.badge-pill.badge-default {{countOwnedAnimals(mountGroups[0], 'mount')}}

    div(v-for="mountGroup in mountGroups",
      v-if="!anyFilterSelected || viewOptions[mountGroup.key].selected",
      :key="mountGroup.key")
      h4(v-if="viewOptions[mountGroup.key].animalCount != 0") {{ mountGroup.label }}

      .pet-row.d-flex(v-for="(group, key, index) in mounts(mountGroup, hideMissing, selectedSortBy, searchTextThrottled)"
        v-if='index === 0 || $_openedItemRows_isToggled(mountGroup.key)')
        .pet-group(v-for='item in group')
          mountItem(
            :item="item",
            :key="item.key",
            :popoverPosition="'top'",
            :showPopover="true",
            @click="selectMount(item)"
          )
            span(slot="popoverContent")
              h4.popover-content-title {{ item.name }}
            template(slot="itemBadge", slot-scope="context")
              starBadge(
                :selected="item.key === currentMount",
                :show="isOwned('mount', item)",
                @click="selectMount(item)",
              )

      .btn.btn-flat.btn-show-more(@click="setShowMore(mountGroup.key)", v-if='mountGroup.key !== "specialMounts"')
        | {{ $_openedItemRows_isToggled(mountGroup.key) ? $t('showLess') : $t('showMore') }}

    inventoryDrawer
      template(slot="item", slot-scope="ctx")
        foodItem(
          :item="ctx.item",
          :itemCount="ctx.itemCount",
          :itemContentClass="ctx.itemClass",
          :active="currentDraggingFood === ctx.item",
          @itemDragEnd="onDragEnd()",
          @itemDragStart="onDragStart($event, ctx.item)",
          @itemClick="onFoodClicked($event, ctx.item)"
        )
  hatchedPetDialog(:hideText="true")
  div.foodInfo(ref="dragginFoodInfo")
    div(v-if="currentDraggingFood != null")
      div.food-icon(:class="'Pet_Food_'+currentDraggingFood.key")
      div.popover
        div.popover-content {{ $t('dragThisFood', {foodName: currentDraggingFood.text() }) }}
  div.foodInfo.mouse(ref="clickFoodInfo", v-if="foodClickMode")
    div(v-if="currentDraggingFood != null")
      div.food-icon(:class="'Pet_Food_'+currentDraggingFood.key")
      div.popover
        div.popover-content {{ $t('clickOnPetToFeed', {foodName: currentDraggingFood.text() }) }}
  mount-raised-modal
  welcome-modal
  hatching-modal(:hatchablePet.sync='hatchablePet')
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
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

  .standard-page .clearfix .float-right {
    margin-right: 24px;
  }

  .inventory-item-container {
    padding: 20px;
    border: 1px solid;
    display: inline-block;
  }

  .hatchablePopover {
    width: 180px
  }

  .potionEggGroup {
    margin: 0 auto;
  }

  .potionEggBackground {
    display: inline-flex;
    align-items: center;

    width: 112px;
    height: 112px;
    border-radius: 4px;
    background-color: #f9f9f9;

    &:first-child {
      margin-right: 24px;
    }

    & div {
      margin: 0 auto;
    }
  }

  .GreyedOut {
    opacity: 0.3;
  }

  .item.item-empty {
    width: 94px;
    height: 92px;
    border-radius: 2px;
    background-color: #edecee;
  }

  .npc_matt {
    margin-bottom: 17px;
  }

  .stable {

    .standard-page {
      padding-right:0;
    }

    .svg-icon.inline.icon-16 {
      vertical-align: bottom;
    }
  }


  .modal-backdrop.fade.show {
    background-color: $purple-50;
    opacity: 0.9;
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
      margin: 0 auto;
      margin-top: 10px;
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

      & div {
        margin: 0 auto;
      }
    }
  }
</style>

<script>
  import { mapState } from 'client/libs/store';

  import _each from 'lodash/each';
  import _sortBy from 'lodash/sortBy';
  import _filter from 'lodash/filter';
  import _throttle from 'lodash/throttle';
  import groupBy from 'lodash/groupBy';

  import Item from '../item';
  import ItemRows from 'client/components/ui/itemRows';
  import PetItem from './petItem';
  import MountItem from './mountItem.vue';
  import FoodItem from './foodItem';
  import HatchedPetDialog from './hatchedPetDialog';
  import MountRaisedModal from './mountRaisedModal';
  import WelcomeModal from './welcomeModal';
  import HatchingModal from './hatchingModal';
  import Drawer from 'client/components/ui/drawer';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import StarBadge from 'client/components/ui/starBadge';
  import CountBadge from 'client/components/ui/countBadge';
  import DrawerSlider from 'client/components/ui/drawerSlider';
  import InventoryDrawer from 'client/components/shared/inventoryDrawer';

  import ResizeDirective from 'client/directives/resize.directive';
  import DragDropDirective from 'client/directives/dragdrop.directive';
  import MouseMoveDirective from 'client/directives/mouseposition.directive';

  import { createAnimal } from 'client/libs/createAnimal';

  import svgInformation from 'assets/svg/information.svg';

  import notifications from 'client/mixins/notifications';
  import openedItemRowsMixin from 'client/mixins/openedItemRows';
  import petMixin from 'client/mixins/petMixin';

  import { CONSTANTS, setLocalSetting, getLocalSetting } from 'client/libs/userlocalManager';
  import {isOwned} from '../../../libs/createAnimal';

  // TODO Normalize special pets and mounts
  // import Store from 'client/store';
  // import deepFreeze from 'client/libs/deepFreeze';
  // const specialMounts =

  let lastMouseMoveEvent = {};

  export default {
    mixins: [notifications, openedItemRowsMixin, petMixin],
    components: {
      PetItem,
      Item,
      ItemRows,
      FoodItem,
      MountItem,
      Drawer,
      toggleSwitch,
      StarBadge,
      CountBadge,
      DrawerSlider,
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
      };
    },
    watch: {
      searchText: _throttle(function throttleSearch () {
        let search = this.searchText.toLowerCase();
        this.searchTextThrottled = search;
      }, 250),
      selectedSortBy: {
        handler () {
          setLocalSetting(CONSTANTS.keyConstants.STABLE_SORT_STATE, this.selectedSortBy);
        },
      },
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
        let petGroups = [
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

        petGroups.map((petGroup) => {
          this.$set(this.viewOptions, petGroup.key, {
            selected: false,
            animalCount: 0,
          });
        });


        return petGroups;
      },
      mountGroups () {
        let mountGroups = [
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

        mountGroups.map((mountGroup) => {
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
            items: _filter(this.content.food, f => {
              return f.key !== 'Saddle' && this.userItems.food[f.key];
            }),
          },
          {
            label: this.$t('special'),
            items: _filter(this.content.food, f => {
              return f.key === 'Saddle' && this.userItems.food[f.key];
            }),
          },
        ];
      },
      anyFilterSelected () {
        return Object.values(this.viewOptions).some(g => g.selected);
      },
    },
    methods: {
      setShowMore (key) {
        this.$_openedItemRows_toggleByType(key, !this.$_openedItemRows_isToggled(key));
      },
      getAnimalList (animalGroup, type) {
        let key = animalGroup.key;

        this.cachedAnimalList = this.cachedAnimalList || {};
        if (this.cachedAnimalList[key]) {
          return this.cachedAnimalList[key];
        }

        let animals = [];
        let userItems = this.userItems;

        switch (key) {
          case 'specialPets':
          case 'specialMounts': {
            _each(animalGroup.petSource.special, (value, specialKey) => {
              let eggKey = specialKey.split('-')[0];
              let potionKey = specialKey.split('-')[1];

              animals.push({
                key: specialKey,
                eggKey,
                potionKey,
                name: this.content[`${type}Info`][specialKey].text(),
                isOwned ()  {
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
            _each(animalGroup.petSource.eggs, (egg) => {
              _each(animalGroup.petSource.potions, (potion) => {
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
        let isPetList = type === 'pet';

        // 1. Filter
        if (hideMissing) {
          animals = _filter(animals, (a) => {
            return a.isOwned();
          });
        }

        if (searchText && searchText !== '') {
          animals = _filter(animals, (a) => {
            return a.name.toLowerCase().indexOf(searchText) !== -1;
          });
        }

        // 2. Sort
        switch (sort) {
          case 'AZ':
            animals = _sortBy(animals, ['eggName']);
            break;

          case 'sortByColor':
            animals = _sortBy(animals, ['potionName']);
            break;

          case 'sortByHatchable': {
            if (isPetList) {
              let sortFunc = (i) => {
                return i.isHatchable() ? 0 : 1;
              };

              animals = _sortBy(animals, [sortFunc]);
            }
            break;
          }
        }

        this.viewOptions[animalGroup.key].animalCount = animals.length;

        return animals;
      },
      countOwnedAnimals (animalGroup, type) {
        let animals = this.getAnimalList(animalGroup, type);

        let countAll = animals.length;
        let countOwned = _filter(animals, (a) => {
          // when counting pets, include those that have been raised into mounts
          return a.isOwned() || a.mountOwned();
        });

        return `${countOwned.length}/${countAll}`;
      },
      pets (animalGroup, hideMissing, sortBy, searchText) {
        let pets = this.listAnimals(animalGroup, 'pet', hideMissing, sortBy, searchText);

        // Don't group special
        if (animalGroup.key === 'specialPets' || animalGroup.key === 'wackyPets') {
          return {none: pets};
        }

        let groupKey = 'eggKey';
        if (sortBy === 'sortByColor') {
          groupKey = 'potionKey';
        } else if (sortBy === 'AZ') {
          groupKey = '';
        }

        return groupBy(pets, groupKey);
      },
      mounts (animalGroup, hideMissing, sortBy, searchText) {
        let mounts = this.listAnimals(animalGroup, 'mount', hideMissing, sortBy, searchText);

        // Don't group special
        if (animalGroup.key === 'specialMounts') {
          return {none: mounts};
        }

        let groupKey = 'eggKey';
        if (sortBy === 'sortByColor') {
          groupKey = 'potionKey';
        } else if (sortBy === 'AZ') {
          groupKey = '';
        }

        return groupBy(mounts, groupKey);
      },
      hasDrawerTabItems (index) {
        return this.drawerTabs && this.drawerTabs[index].items.length !== 0;
      },
      // Actions
      updateHideMissing (newVal) {
        this.hideMissing = newVal;
      },
      selectPet (item) {
        this.$store.dispatch('common:equip', {key: item.key, type: 'pet'});
      },
      selectMount (item) {
        this.$store.dispatch('common:equip', {key: item.key, type: 'mount'});
      },
      onDragStart (ev, food) {
        this.currentDraggingFood = food;

        let itemRef = this.$refs.dragginFoodInfo;

        let dragEvent = ev.event;

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

          if (this.user.preferences.suppressModals.raisePet) {
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
          const result = await this.$store.dispatch('common:feed', {pet: petKey, food: foodKey});

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
