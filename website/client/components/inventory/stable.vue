<template lang="pug">
  .row.stable
    .col-2.standard-sidebar
      .form-group
        input.form-control.input-search(type="text", :placeholder="$t('search')")

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
          .form-check
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) Standard
          .form-check
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('hatchingPotions') }}
          .form-check
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('quest') }}
          .form-check
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('special') }}
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
            v-for="sort in sortByItems", @click="selectedSortBy = sort", :active="selectedSortBy === sort") {{ $t(sort) }}


      h2(v-once) {{ $t('pets') }}

      div(
        v-for="petGroup in petGroups",
        v-if="viewOptions[petGroup.key].selected",
        :key="petGroup.key"
      )
        h4(v-once) {{ petGroup.label }}

        .items
          item(
            v-for="pet in pets(petGroup, viewOptions[petGroup.key].open, hideMissing, selectedSortBy)",
            :item="pet",
            :itemContentClass="pet.isOwned ? ('Pet Pet-' + pet.key) : 'PixelPaw'",
            :key="pet.key",
            :showPopover="true",
            :selected="pet.key === currentPet",
            :starVisible="true",
            :label="pet.value",
            :popoverPosition="'top'",
            @click="selectPet"
          )
            span(slot="popoverContent", v-once) {{ pet }}

        .btn.btn-show-more(@click="viewOptions[petGroup.key].open = !viewOptions[petGroup.key].open") {{ viewOptions[petGroup.key].open ? 'Close' : 'Open' }}


      h2 Mounts

      h4 Standard Mounts
      h4 Magic Potion Mounts
      h4 Quest Mounts
      h4 Special Mounts
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


  import each from 'lodash/each';
  import sortBy from 'lodash/sortBy';

  import Item from 'client/components/inventory/item';
  import Drawer from 'client/components/inventory/drawer';
  import toggleSwitch from 'client/components/ui/toggleSwitch';

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
    },
    data () {
      return {
        viewOptions: {},
        hideMissing: false,
        selectedSortBy: 'standard',
        sortByItems: [
          'standard',
          'AZ',
          'sortByColor',
          'sortByHatchable'
        ],
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        currentPet: 'user.data.items.currentPet',
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
            key: 'rarePets',
            petSource: {
              eggs: this.content.dropEggs,
              potions: this.content.dropHatchingPotions,
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
    },
    methods: {
      // negue: if performance gets slow, maybe create a cache of the static data, like names / keys?
      listAnimals (type, eggSource, potionSource, isOpen, hideMissing, sort) {
        let animals = [];
        let iteration = 0;

        each(eggSource, (egg) => {
          if (iteration === 1 && !isOpen) return false;
          iteration++;
          each(potionSource, (potion) => {
            let animalKey = `${egg.key}-${potion.key}`;
            let isOwned = this.userItems.pets[animalKey] > 0;

            if (hideMissing && !isOwned) {
              return true;
            }

            let hatchable = this.userItems.eggs[egg.key] > 0 && this.userItems.hatchingPotions[potion.key] > 0;

            animals.push({
              key: animalKey,
              potionName: potion.text(),
              isOwned,
              hatchable,
              pet: this.content[`${type}Info`][animalKey].text(),
            });
          });
        });

        switch(sort) {
          case 'AZ': {
            animals = sortBy(animals, ['pet']);
          }
          case 'sortByColor': {
            animals = sortBy(animals, ['potionName']);
          }
          case 'sortByHatchable': {
            animals = sortBy(animals, [(i) => i.hatchable ? 0 : 1])
          }
        }

        return animals;
      },

      pets (petGroup, showAll, hideMissing, sortBy) {
        return this.listAnimals('pet', petGroup.petSource.eggs, petGroup.petSource.potions, showAll, hideMissing, sortBy);
      },

      updateHideMissing (newVal) {
        this.hideMissing = newVal;
      },

      selectPet (item) {
        this.$store.dispatch('common:selectPet', { key: item.key });
      },
    },
  };
</script>
