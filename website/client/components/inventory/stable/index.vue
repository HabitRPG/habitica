<template lang="pug">
  // @TODO: breakdown to componentes and use some SOLID
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
          h3.float-left Hide Missing
          toggle-switch.float-right.no-margin(
            :label="''",
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

      div(
        v-for="(petGroup, index) in petGroups",
        v-if="viewOptions[petGroup.key].selected",
        :key="petGroup.key"
      )
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
              :itemContentClass="getPetItemClass(item)",
              :popoverPosition="'top'",
              :progress="item.progress",
              :emptyItem="!item.isOwned()",
              :showPopover="currentDraggingFood == null",
              :highlightBorder="highlightPet == item.key",
              @click="petClicked(item)"
            )
              span(slot="popoverContent")
                div.hatchablePopover(v-if="item.isHatchable()")
                  h4.popover-content-title {{ item.name }}
                  div.popover-content-text(v-html="$t('haveHatchablePet', { potion: item.potionName, egg: item.eggName })")
                  div.potionEggGroup
                    div.potionEggBackground
                      div(:class="'Pet_HatchingPotion_'+item.potionKey")
                    div.potionEggBackground
                      div(:class="'Pet_Egg_'+item.eggKey")
                div(v-else)
                  h4.popover-content-title {{ item.name }}
              template(slot="itemBadge", slot-scope="context")
                starBadge(:selected="item.key === currentPet", :show="item.isOwned()", @click="selectPet(item)")

        .btn.btn-flat.btn-show-more(@click="setShowMore(petGroup.key)", v-if='petGroup.key !== "specialPets"')
          | {{ $_openedItemRows_isToggled(petGroup.key) ? $t('showLess') : $t('showMore') }}

      h2
        | {{ $t('mounts') }}
        |
        span.badge.badge-pill.badge-default {{countOwnedAnimals(mountGroups[0], 'mount')}}

      div(
        v-for="mountGroup in mountGroups",
        v-if="viewOptions[mountGroup.key].selected",
        :key="mountGroup.key"
      )
        h4(v-if="viewOptions[mountGroup.key].animalCount != 0") {{ mountGroup.label }}

        .pet-row.d-flex(v-for="(group, key, index) in mounts(mountGroup, hideMissing, selectedSortBy, searchTextThrottled)"
          v-if='index === 0 || $_openedItemRows_isToggled(mountGroup.key)')
          .pet-group(v-for='item in group')
            mountItem(
              :item="item",
              :itemContentClass="item.isOwned() ? ('Mount_Icon_' + item.key) : 'PixelPaw GreyedOut'",
              :key="item.key",
              :popoverPosition="'top'",
              :emptyItem="!item.isOwned()",
              :showPopover="true",
              @click="selectMount(item)"
            )
              span(slot="popoverContent")
                h4.popover-content-title {{ item.name }}
              template(slot="itemBadge", slot-scope="context")
                starBadge(
                  :selected="item.key === currentMount",
                  :show="item.isOwned()",
                  @click="selectMount(item)",
                )

        .btn.btn-flat.btn-show-more(@click="setShowMore(mountGroup.key)", v-if='mountGroup.key !== "specialMounts"')
          | {{ $_openedItemRows_isToggled(mountGroup.key) ? $t('showLess') : $t('showMore') }}

      drawer(
        :title="$t('quickInventory')",
        :errorMessage="(!hasDrawerTabItems(selectedDrawerTab)) ? ((selectedDrawerTab === 0) ?  $t('noFoodAvailable') : $t('noSaddlesAvailable')) : null"
      )
        div(slot="drawer-header")
          .drawer-tab-container
            .drawer-tab.text-right
              a.drawer-tab-text(
                @click="selectedDrawerTab = 0",
                :class="{'drawer-tab-text-active': selectedDrawerTab === 0}",
              ) {{ drawerTabs[0].label }}
            .clearfix
              .drawer-tab.float-left
                a.drawer-tab-text(
                  @click="selectedDrawerTab = 1",
                  :class="{ 'drawer-tab-text-active': selectedDrawerTab === 1 }",
                )  {{ drawerTabs[1].label }}

              #petLikeToEatStable.drawer-help-text(v-once)
                | {{ $t('petLikeToEat') + ' ' }}
                span.svg-icon.inline.icon-16(v-html="icons.information")
              b-popover(
                target="petLikeToEatStable"
                placement="top"
              )
                .popover-content-text(v-html="$t('petLikeToEatText')", v-once)
        drawer-slider(
          :items="drawerTabs[selectedDrawerTab].items",
          :scrollButtonsVisible="hasDrawerTabItems(selectedDrawerTab)",
          slot="drawer-slider",
          :itemWidth=94,
          :itemMargin=24,
          :itemType="selectedDrawerTab"
        )
          template(slot="item", slot-scope="context")
            foodItem(
              :item="context.item",
              :itemCount="userItems.food[context.item.key]",
              :active="currentDraggingFood == context.item",
              @itemDragEnd="onDragEnd()",
              @itemDragStart="onDragStart($event, context.item)",
              @itemClick="onFoodClicked($event, context.item)"
            )

    b-modal#welcome-modal(
      :ok-only="true",
      :ok-title="$t('gotIt')",
      :visible="!hideDialog",
      :hide-header="true",
      @hide="hideFlag()"
    )
      div.content
        div.npc_matt
        h1.page-header(v-once) {{ $t('welcomeStable') }}
        div.content-text(v-once) {{ $t('welcomeStableText') }}

    b-modal#hatching-modal(
      @change="resetHatchablePet($event)"
    )
      div.content(v-if="hatchablePet")
        div.potionEggGroup
          div.potionEggBackground
            div(:class="'Pet_HatchingPotion_'+hatchablePet.potionKey")
          div.potionEggBackground
            div(:class="'Pet_Egg_'+hatchablePet.eggKey")

        h4.title {{ hatchablePet.name }}
        div.text(v-html="$t('hatchDialogText', { potionName: hatchablePet.potionName, eggName: hatchablePet.eggName, petName: hatchablePet.name })")

      span.svg-icon.icon-10(v-html="icons.close", slot="modal-header", @click="closeHatchPetDialog()")

      div(slot="modal-footer")
        button.btn.btn-primary(@click="hatchPet(hatchablePet)") {{ $t('hatch') }}
        button.btn.btn-secondary.btn-flat(@click="closeHatchPetDialog()") {{ $t('cancel') }}

    hatchedPetDialog(
      :hideText="true",
    )

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

  .stable .item .item-content.Pet:not(.FlyingPig) {
    top: -28px;
  }

  .stable .item .item-content.FlyingPig {
    top: 7px;
  }

  .stable .item .item-content.Pet-Dragon-Hydra {
    top: -16px !important;
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

  .drawer-slider .items {
    height: 114px;
  }

  #welcome-modal {
    @include centeredModal();

    .npc_matt {
      margin: 0 auto 21px auto;
    }

    .content {
      text-align: center;

      // the modal already has 15px padding
      margin-left: 33px;
      margin-right: 33px;
      margin-top: 25px;
    }

    .content-text {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.43;

      width: 400px;
    }

    .modal-footer {
      justify-content: center;
    }
  }

  #hatching-modal {
    @include centeredModal();

    .content {
      text-align: center;

      margin: 9px;
      width: 300px;
    }

    .title {
      margin-top: 24px;
      font-family: Roboto;
      font-size: 20px;
      font-weight: bold;
      font-stretch: condensed;
      line-height: 1.2;
      text-align: center;
      color: #4e4a57;
    }

    .text {
      height: 60px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 1.43;
      text-align: center;
      color: #686274;
    }

    span.svg-icon.icon-10 {
      position: absolute;
      right: 10px;
      top: 10px;
    }

    .modal-footer {
      justify-content: center;
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
      margin: 0 auto;
    }

    .popover {
      position: inherit;
      width: 180px;
    }

    .popover-content {
      color: white;
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
  import {mapState} from 'client/libs/store';

  import _each from 'lodash/each';
  import _sortBy from 'lodash/sortBy';
  import _filter from 'lodash/filter';
  import _flatMap from 'lodash/flatMap';
  import _throttle from 'lodash/throttle';
  import groupBy from 'lodash/groupBy';

  import Item from '../item';
  import ItemRows from 'client/components/ui/itemRows';
  import PetItem from './petItem';
  import MountItem from './mountItem.vue';
  import FoodItem from './foodItem';
  import HatchedPetDialog from './hatchedPetDialog';
  import Drawer from 'client/components/ui/drawer';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import StarBadge from 'client/components/ui/starBadge';
  import CountBadge from 'client/components/ui/countBadge';
  import DrawerSlider from 'client/components/ui/drawerSlider';

  import ResizeDirective from 'client/directives/resize.directive';
  import DragDropDirective from 'client/directives/dragdrop.directive';
  import MouseMoveDirective from 'client/directives/mouseposition.directive';

  import createAnimal from 'client/libs/createAnimal';

  import svgInformation from 'assets/svg/information.svg';
  import svgClose from 'assets/svg/close.svg';

  import notifications from 'client/mixins/notifications';
  import openedItemRowsMixin from 'client/mixins/openedItemRows';

  // TODO Normalize special pets and mounts
  // import Store from 'client/store';
  // import deepFreeze from 'client/libs/deepFreeze';
  // const specialMounts =

  let lastMouseMoveEvent = {};

  export default {
    mixins: [notifications, openedItemRowsMixin],
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
    },
    directives: {
      resize: ResizeDirective,
      drag: DragDropDirective,
      mousePosition: MouseMoveDirective,
    },
    data () {
      return {
        viewOptions: {},
        hideMissing: false,

        searchText: null,
        searchTextThrottled: '',

        // sort has the translation-keys as values
        selectedSortBy: 'standard',
        sortByItems: [
          'standard',
          'AZ',
          'sortByColor',
          'sortByHatchable',
        ],

        icons: Object.freeze({
          information: svgInformation,
          close: svgClose,
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
    },
    computed: {
      ...mapState({
        content: 'content',
        currentPet: 'user.data.items.currentPet',
        currentMount: 'user.data.items.currentMount',
        userItems: 'user.data.items',
        hideDialog: 'user.data.flags.tutorial.common.mounts',
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
            label: this.$t('special'),
            key: 'specialPets',
            petSource: {
              special: this.content.specialPets,
            },
          },
        ];

        petGroups.map((petGroup) => {
          this.$set(this.viewOptions, petGroup.key, {
            selected: true,
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
            selected: true,
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
                  return userItems[`${type}s`][this.key] > 0;
                },
                mountOwned () {
                  return userItems.mounts[this.key] > 0;
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
        let withProgress = isPetList && animalGroup.key !== 'specialPets';

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

        let animalRows = withProgress ? _flatMap(animals, (a) => {
          let progress = this.userItems[`${type}s`][a.key];

          return {
            ...a,
            progress,
          };
        }) : animals;

        this.viewOptions[animalGroup.key].animalCount = animals.length;

        return animalRows;
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
        if (animalGroup.key === 'specialPets') {
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

      getPetItemClass (pet) {
        if (pet.isOwned()) {
          return `Pet Pet-${pet.key} ${pet.eggKey}`;
        }

        if (pet.mountOwned()) {
          return `GreyedOut Pet Pet-${pet.key} ${pet.eggKey}`;
        }

        if (pet.isHatchable()) {
          return 'PixelPaw';
        }

        return 'GreyedOut PixelPaw';
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

      hatchPet (pet) {
        this.$store.dispatch('common:hatch', {egg: pet.eggKey, hatchingPotion: pet.potionKey});

        this.closeHatchPetDialog();
        this.$root.$emit('hatchedPet::open', pet);
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
          // opens the hatch dialog
          this.hatchablePet = pet;

          this.$root.$emit('bv::show::modal', 'hatching-modal');
        }
      },

      async feedAction (petKey, foodKey) {
        let result = await this.$store.dispatch('common:feed', {pet: petKey, food: foodKey});

        if (result.message) {
          this.text(result.message);
        }
      },

      closeHatchPetDialog () {
        this.$root.$emit('bv::hide::modal', 'hatching-modal');
      },

      resetHatchablePet ($event) {
        if (!$event) {
          this.hatchablePet = null;
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
        if (this.foodClickMode) {
          this.$refs.clickFoodInfo.style.left = `${$event.x - 70}px`;
          this.$refs.clickFoodInfo.style.top = `${$event.y}px`;
        } else {
          lastMouseMoveEvent = $event;
        }
      },

      hideFlag () {
        this.$store.dispatch('user:set', {
          'flags.tutorial.common.mounts': true,
        });
      },
    },
  };
</script>
