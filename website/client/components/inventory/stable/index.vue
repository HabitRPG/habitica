<template lang="pug">
  .row.stable
    .col-2.standard-sidebar
      .form-group
        input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        h3(v-once) {{ $t('pets') }}
        .form-group
          .form-check(v-for="petGroup in petGroups", :key="petGroup.key", v-once)
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", v-model="viewOptions[petGroup.key].selected")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ petGroup.label }}
        h3(v-once) {{ $t('mounts') }}
        .form-group
          .form-check(v-for="mountGroup in mountGroups", :key="mountGroup.key", v-once)
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

    .col-10.standard-page
      .clearfix
        h1.float-left.mb-0.page-header(v-once) {{ $t('stable') }}
        b-dropdown.float-right(:text="$t('sortBy') +((selectedSortBy === 'standard')?'': ': '+ $t(selectedSortBy))", right=true)
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
        h4(v-once) {{ petGroup.label }}

        div.items(v-for="(petRow, index) in pets(petGroup, viewOptions[petGroup.key].open, hideMissing, selectedSortBy, searchTextThrottled)")
          item(
            v-for="pet in petRow",
            :item="pet",
            :itemContentClass="pet.isOwned ? ('Pet Pet-' + pet.key) : 'PixelPaw'",
            :key="pet.key",
            :showPopover="true",
            :starVisible="true",
            :label="pet.value",
            :popoverPosition="'top'",
            :progress="pet.progress",
            @click="selectPet"
          )
            span(slot="popoverContent", v-once) {{ pet }}
            template(slot="itemBadge", scope="ctx")
              starBadge(
                :selected="ctx.item.key === currentPet",
                :show="true",
                @click="selectPet(ctx.item)",
              )

        .btn.btn-show-more(@click="viewOptions[petGroup.key].open = !viewOptions[petGroup.key].open") {{ viewOptions[petGroup.key].open ? 'Close' : 'Open' }}

      h2
        | {{ $t('mounts') }}
        |
        span.badge.badge-pill.badge-default {{countOwnedAnimals(mountGroups[0], 'mount')}}

      div(
        v-for="mountGroup in mountGroups",
        v-if="viewOptions[mountGroup.key].selected",
        :key="mountGroup.key"
      )
        h4(v-once) {{ mountGroup.label }}

        div.items(v-for="(mountRow, index) in mounts(mountGroup, viewOptions[mountGroup.key].open, hideMissing, selectedSortBy, searchTextThrottled)")
          item(
            v-for="mount in mountRow",
            :item="mount",
            :itemContentClass="mount.isOwned ? ('Mount_Icon_' + mount.key) : 'PixelPaw'",
            :key="mount.key",
            :showPopover="true",
            :starVisible="true",
            :label="mount.value",
            :popoverPosition="'top'",
            @click="selectMount"
          )
            span(slot="popoverContent", v-once) {{ mount }}
            template(slot="itemBadge", scope="ctx")
              starBadge(
                :selected="ctx.item.key === currentMount",
                :show="true",
                @click="selectMount(ctx.item)",
              )

        .btn.btn-show-more(@click="viewOptions[mountGroup.key].open = !viewOptions[mountGroup.key].open") {{ viewOptions[mountGroup.key].open ? 'Close' : 'Open' }}

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
</style>

<script>
  import {mapState} from 'client/libs/store';

  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';


  import _each from 'lodash/each';
  import _sortBy from 'lodash/sortBy';
  import _take from 'lodash/take';
  import _filter from 'lodash/filter';
  import _drop from 'lodash/drop';
  import _flatMap from 'lodash/flatMap';
  import _throttle from 'lodash/throttle';

  import Item from './petItem';
  import Drawer from 'client/components/inventory/drawer';
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import StarBadge from 'client/components/inventory/starBadge';

  // TODO Normalize special pets and mounts
  // import Store from 'client/store';
  // import deepFreeze from 'client/libs/deepFreeze';
  // const specialMounts =

  export default {
    components: {
      Item,
      Drawer,
      bDropdown,
      bDropdownItem,
      toggleSwitch,
      StarBadge,
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
      };
    },
    watch: {
      searchText: _throttle(function throttleSearch() {
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
              pets: this.content.specialPets,
            },
          },
        ];

        petGroups.map((petGroup) => {
          this.$set(this.viewOptions, petGroup.key, {
            selected: true,
            open: false,
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
          /*{
            label: this.$t('special'),
            key: 'specialMounts',
            petSource: {
              pets: this.content.specialMounts,
            },
          },*/
        ];

        mountGroups.map((mountGroup) => {
          this.$set(this.viewOptions, mountGroup.key, {
            selected: true,
            open: false,
          });
        });


        return mountGroups;
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

        if (key === 'specialPets') {
          _each(animalGroup.petSource.pets, (value, specialKey) => {
            let eggKey = specialKey.split('-')[0];
            let potionKey = specialKey.split('-')[1];
            let isOwned = this.userItems[`${type}s`][specialKey] > 0;

            animals.push({
              key: specialKey,
              eggKey,
              potionKey,
              pet: this.content[`${type}Info`][specialKey].text(),
              isOwned,
            });
          });
        } else {
          _each(animalGroup.petSource.eggs, (egg) => {
            _each(animalGroup.petSource.potions, (potion) => {
              let animalKey = `${egg.key}-${potion.key}`;
              let isOwned = this.userItems[`${type}s`][animalKey] > 0;
              let hatchable = this.userItems.eggs[egg.key] > 0 && this.userItems.hatchingPotions[potion.key] > 0;

              animals.push({
                key: animalKey,
                eggKey: egg.key,
                potionKey: potion.key,
                potionName: potion.text(),
                pet: this.content[`${type}Info`][animalKey].text(),
                isOwned,
                hatchable,
              });
            });
          });
        }

        this.cachedAnimalList[key] = animals;

        return animals;
      },

      listAnimals (animalGroup, type, isOpen, hideMissing, sort, searchText) {
        let animals = this.getAnimalList(animalGroup, type);
        let isPetList = type === 'pet';
        let withProgress = isPetList && animalGroup.key !== 'specialPets';

        // 1. Filter
        if (hideMissing) {
          animals = _filter(animals, 'isOwned');
        }

        if (searchText && searchText !== '') {
          animals = _filter(animals, (a) => {
              return a.pet.toLowerCase().indexOf(searchText) !== -1;
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
                return i.hatchable ? 0 : 1;
              };

              animals = _sortBy(animals, [sortFunc]);
            }
            break;
          }
        }

        let animalRows = [];

        let rowsToShow = isOpen ? Math.round(animals.length / 10) : 1;

        for (let i = 0; i < rowsToShow; i++) {
          let skipped = _drop(animals, i * 10);
          let row = _take(skipped, 10);

          let rowWithProgressData = withProgress ? _flatMap(row, (a) => {
            let progress = this.userItems[`${type}s`][a.key];

            return {
              ...a,
              progress,
            };
          }) : row;

          animalRows.push(rowWithProgressData);
        }

        return animalRows;
      },

      countOwnedAnimals(animalGroup, type) {
        let animals = this.getAnimalList(animalGroup, type);

        let countAll = animals.length;
        let countOwned = _filter(animals, 'isOwned');

        return `${countOwned.length}/${countAll}`;
      },

      pets (animalGroup, showAll, hideMissing, sortBy, searchText) {
        return this.listAnimals(animalGroup, 'pet', showAll, hideMissing, sortBy, searchText);
      },

      mounts (animalGroup, showAll, hideMissing, sortBy, searchText) {
        return this.listAnimals(animalGroup, 'mount', showAll, hideMissing, sortBy, searchText);
      },

      updateHideMissing (newVal) {
        this.hideMissing = newVal;
      },

      selectPet (item) {
        this.$store.dispatch('common:equip', {key: item.key, type: 'pet'});
      },

      selectMount (item) {
        this.$store.dispatch('common:equip', {key: item.key, type: 'mount'});
      },
    },
  };
</script>
