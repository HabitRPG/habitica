<template lang="pug">
  .row.stable
    .standard-sidebar
      div
        b-popover(
          :triggers="['hover']",
          :placement="'right'"
        )
          span(slot="content")
            h4.popover-content-title(v-once) {{ $t('mattBoch') }}
            .popover-content-text(v-once) {{ $t('mattBochText1') }}

          div.npc_matt

      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        h3(v-once) {{ $t('pets') }}
        .form-group
          .form-check(
            v-for="petGroup in petGroups",
            v-if="viewOptions[petGroup.key].animalCount != 0",
            :key="petGroup.key"
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[petGroup.key].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ petGroup.label }}
        h3(v-once) {{ $t('mounts') }}
        .form-group
          .form-check(
            v-for="mountGroup in mountGroups",
            v-if="viewOptions[mountGroup.key].animalCount != 0",
            :key="mountGroup.key"
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[mountGroup.key].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ mountGroup.label }}

        div.form-group.clearfix
          h3.float-left Hide Missing
          toggle-switch.float-right.hideMissing(
            :label="''",
            :checked="hideMissing",
            @change="updateHideMissing"
          )

    .standard-page(v-resize="500", @resized="availableContentWidth = $event.width - 48")
      .clearfix
        h1.float-left.mb-0.page-header(v-once) {{ $t('stable') }}

        div.float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t(selectedSortBy)", right=true)
            b-dropdown-item(
              v-for="sort in sortByItems",
              @click="selectedSortBy = sort",
              :active="selectedSortBy === sort",
              :key="sort"
            ) {{ $t(sort) }}

      h2
        | {{ $t('pets') }}
        |
        span.badge.badge-pill.badge-default {{countOwnedAnimals(petGroups[0], 'pet')}}

      div(
        v-for="petGroup in petGroups",
        v-if="viewOptions[petGroup.key].selected",
        :key="petGroup.key"
      )
        h4(v-if="viewOptions[petGroup.key].animalCount != 0") {{ petGroup.label }}

        div.items
          div(
            v-for="pet in pets(petGroup, viewOptions[petGroup.key].open, hideMissing, selectedSortBy, searchTextThrottled, availableContentWidth)",
            :key="pet.key",
            v-drag.drop.food="pet.key",
            @dragover="onDragOver($event, pet)",
            @dropped="onDrop($event, pet)",
          )
            petItem(
              :item="pet",
              :itemContentClass="getPetItemClass(pet)",
              :popoverPosition="'top'",
              :progress="pet.progress",
              :emptyItem="!pet.isOwned()",
              :showPopover="pet.isOwned() || pet.isHatchable()",
              @hatchPet="hatchPet",
            )
              span(slot="popoverContent")
                div(v-if="pet.isOwned()")
                  h4.popover-content-title {{ pet.name }}
                div.hatchablePopover(v-else-if="pet.isHatchable()")
                  h4.popover-content-title {{ pet.name }}
                  div.popover-content-text(v-html="$t('haveHatchablePet', { potion: pet.potionName, egg: pet.eggName })")
                  div.potionEggGroup
                    div.potionEggBackground
                      div(:class="'Pet_HatchingPotion_'+pet.potionKey")
                    div.potionEggBackground
                      div(:class="'Pet_Egg_'+pet.eggKey")

              template(slot="itemBadge", scope="ctx")
                starBadge(
                  :selected="ctx.item.key === currentPet",
                  :show="ctx.item.isOwned()",
                  @click="selectPet(ctx.item)",
                )

        .btn.btn-show-more(
          @click="viewOptions[petGroup.key].open = !viewOptions[petGroup.key].open",
          v-if="viewOptions[petGroup.key].animalCount != 0"
        ) {{ $t(viewOptions[petGroup.key].open ? 'showLessAnimals' : 'showAllAnimals', { color: petGroup.label, type: $t('pets')}) }}

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

        div.items
          item(
            v-for="mount in mounts(mountGroup, viewOptions[mountGroup.key].open, hideMissing, selectedSortBy, searchTextThrottled, availableContentWidth)",
            :item="mount",
            :itemContentClass="mount.isOwned() ? ('Mount_Icon_' + mount.key) : 'PixelPaw greyedOut'",
            :key="mount.key",
            :popoverPosition="'top'"
          )
            span(slot="popoverContent")
              h4.popover-content-title {{ mount.name }}
            template(slot="itemBadge", scope="ctx")
              starBadge(
                :selected="ctx.item.key === currentMount",
                :show="mount.isOwned()",
                @click="selectMount(ctx.item)",
              )

        .btn.btn-show-more(
          @click="viewOptions[mountGroup.key].open = !viewOptions[mountGroup.key].open",
          v-if="viewOptions[mountGroup.key].animalCount != 0"
        ) {{ $t(viewOptions[mountGroup.key].open ? 'showLessAnimals' : 'showAllAnimals', { color: mountGroup.label, type: $t('mounts')}) }}

      drawer(
        :title="$t('quickInventory')",
        :errorMessage="(!hasDrawerTabItems(selectedDrawerTab)) ? $t('noFood') : null"
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

              b-popover(
                :triggers="['hover']",
                :placement="'top'"
              )
                span(slot="content")
                  .popover-content-text Test Popover

                div.float-right What does my pet like to eat?


        drawer-slider(
          :items="drawerTabs[selectedDrawerTab].items",
          :scrollButtonsVisible="hasDrawerTabItems(selectedDrawerTab)",
          slot="drawer-slider",
          :itemWidth=94,
          :itemMargin=24,
        )
          template(slot="item", scope="ctx")
            foodItem(
              :item="ctx.item",
              :itemCount="userItems.food[ctx.item.key]",
            )
</template>

<style lang="scss">
  .inventory-item-container {
    padding: 20px;
    border: 1px solid;
    display: inline-block;
  }

  .stable .item .item-content.Pet {
    position: absolute;
    top: -28px;
  }

  .toggle-switch-container.hideMissing {
    margin-top: 0;
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
      flex: 1;
    }

    .drawer-container {
      // 3% padding + 252px sidebar width
      left: calc(3% + 252px) !important;
    }
  }

  .drawer-slider .items {
    height: 114px;
  }

</style>

<script>
  import {mapState} from 'client/libs/store';

  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
  import bPopover from 'bootstrap-vue/lib/components/popover';

  import _each from 'lodash/each';
  import _sortBy from 'lodash/sortBy';
  import _take from 'lodash/take';
  import _filter from 'lodash/filter';
  import _drop from 'lodash/drop';
  import _flatMap from 'lodash/flatMap';
  import _throttle from 'lodash/throttle';

  import Item from '../item';
  import PetItem from './petItem';
  import FoodItem from './foodItem';
  import Drawer from 'client/components/inventory/drawer';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import StarBadge from 'client/components/inventory/starBadge';
  import CountBadge from './countBadge';
  import DrawerSlider from './drawerSlider';

  import ResizeDirective from 'client/directives/resize.directive';
  import DragDropDirective from 'client/directives/dragdrop.directive';

  // TODO Normalize special pets and mounts
  // import Store from 'client/store';
  // import deepFreeze from 'client/libs/deepFreeze';
  // const specialMounts =

  export default {
    components: {
      PetItem,
      Item,
      FoodItem,
      Drawer,
      bDropdown,
      bDropdownItem,
      bPopover,
      toggleSwitch,
      StarBadge,
      CountBadge,
      DrawerSlider,
    },
    directives: {
      resize: ResizeDirective,
      drag: DragDropDirective,
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

        selectedDrawerTab: 0,
        availableContentWidth: 0,
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
            alwaysHideMissing: true,
          },
        ];

        petGroups.map((petGroup) => {
          this.$set(this.viewOptions, petGroup.key, {
            selected: true,
            open: false,
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
            alwaysHideMissing: true,
          },
        ];

        mountGroups.map((mountGroup) => {
          this.$set(this.viewOptions, mountGroup.key, {
            selected: true,
            open: false,
            animalCount: 0,
          });
        });


        return mountGroups;
      },

      drawerTabs () {
        return [
          {
            label: this.$t('food'),
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
                pet: this.content[`${type}Info`][specialKey].text(),
                isOwned ()  {
                  return [`${type}s`][this.key] > 0;
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
                let animalKey = `${egg.key}-${potion.key}`;

                animals.push({
                  key: animalKey,
                  eggKey: egg.key,
                  eggName: egg.text(),
                  potionKey: potion.key,
                  potionName: potion.text(),
                  name: this.content[`${type}Info`][animalKey].text(),
                  isOwned ()  {
                    return userItems[`${type}s`][animalKey] > 0;
                  },
                  isHatchable () {
                    return userItems.eggs[egg.key] > 0 && userItems.hatchingPotions[potion.key] > 0;
                  },
                });
              });
            });
          }
        }

        this.cachedAnimalList[key] = animals;

        return animals;
      },

      listAnimals (animalGroup, type, isOpen, hideMissing, sort, searchText, availableSpace) {
        let animals = this.getAnimalList(animalGroup, type);
        let isPetList = type === 'pet';
        let withProgress = isPetList && animalGroup.key !== 'specialPets';

        // 1. Filter
        if (hideMissing || animalGroup.alwaysHideMissing) {
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
            animals = _sortBy(animals, ['pet']);
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

        let animalRows = [];

        let itemsPerRow = Math.floor(availableSpace / (94 + 24));

        let rowsToShow = isOpen ? Math.ceil(animals.length / itemsPerRow) : 1;

        for (let i = 0; i < rowsToShow; i++) {
          let skipped = _drop(animals, i * itemsPerRow);
          let row = _take(skipped, itemsPerRow);

          let rowWithProgressData = withProgress ? _flatMap(row, (a) => {
            let progress = this.userItems[`${type}s`][a.key];

            return {
              ...a,
              progress,
            };
          }) : row;

          animalRows.push(...rowWithProgressData);
        }

        this.viewOptions[animalGroup.key].animalCount = animals.length;

        return animalRows;
      },

      countOwnedAnimals (animalGroup, type) {
        let animals = this.getAnimalList(animalGroup, type);

        let countAll = animals.length;
        let countOwned = _filter(animals, (a) => {
          return a.isOwned();
        });

        return `${countOwned.length}/${countAll}`;
      },

      pets (animalGroup, showAll, hideMissing, sortBy, searchText, availableSpace) {
        return this.listAnimals(animalGroup, 'pet', showAll, hideMissing, sortBy, searchText, availableSpace);
      },

      mounts (animalGroup, showAll, hideMissing, sortBy, searchText, availableSpace) {
        return this.listAnimals(animalGroup, 'mount', showAll, hideMissing, sortBy, searchText, availableSpace);
      },

      getPetItemClass (pet) {
        if (pet.isOwned()) {
          return `Pet Pet-${pet.key}`;
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
      },

      onDragOver (ev, pet) {
        if (this.userItems.mounts[pet.key]) {
          ev.dropable = false;
        }
      },

      onDrop (ev, pet) {
        this.$store.dispatch('common:feed', {pet: pet.key, food: ev.draggingKey});
      },
    },
  };
</script>
