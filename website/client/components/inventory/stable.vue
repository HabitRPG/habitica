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

    .col-10.standard-page
      .clearfix
        h1.float-left.mb-0.page-header(v-once) {{ $t('stable') }}
        b-dropdown.float-right(text="Sort by", right=true)
          b-dropdown-item(href="#") Option 1
          b-dropdown-item(href="#") Option 2
          b-dropdown-item(href="#") Option 3


      h2(v-once) {{ $t('pets') }}

      div(
        v-for="petGroup in petGroups",
        v-if="viewOptions[petGroup.key].selected",
        :key="petGroup.key"
      )
        h4(v-once) {{ petGroup.label }}

        .items
          item(
            v-for="pet in pets(petGroup, viewOptions[petGroup.key].open)",
            :item="pet",
            :itemContentClass="pet.isOwned ? ('Pet Pet-' + pet.key) : 'PixelPaw'",
            :key="pet.key",
            :showPopover="true",
            :selected="pet.key === currentPet",
            :starVisible="true",
            :label="pet.value",
            :popoverPosition="'top'",
            @click="selectPet",
            v-once
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
    top: -18px;
    right: inherit;
    width: 80px;
    height: 94px;
  }

  .stable .item .item-content.PixelPaw {
    position: absolute;
    top: 15px;
    right: 21px;
    width: 51px;
    height: 51px;
  }
</style>

<script>
  import {mapState} from 'client/libs/store';

  import bDropdown from 'bootstrap-vue/lib/components/dropdown';
  import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

  import each from 'lodash/each';

  import Item from 'client/components/inventory/item';
  import Drawer from 'client/components/inventory/drawer';

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
    },
    data () {
      return {
        viewOptions: {},
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        currentPet: 'user.data.items.currentPet',
        userPets: 'user.data.items.pets',
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
      }
    },
    methods: {
      listAnimals (type, eggSource, potionSource, isOpen = false) {
        let animals = [];
        let iteration = 0;

        each(eggSource, (egg) => {
          if (iteration === 1 && !isOpen) return false;
          iteration++;
          each(potionSource, (potion) => {
            let animalKey = `${egg.key}-${potion.key}`;
            animals.push({
              key: animalKey,
              isOwned: this.userPets[animalKey] > 0,
              pet: this.content[`${type}Info`][animalKey].text(),
            });
          });
        });

        return animals;
      },
      pets (petGroup, showAll) {
        return this.listAnimals('pet', petGroup.petSource.eggs, petGroup.petSource.potions, showAll);
      },

      equip (item) {
        this.$store.dispatch('common:selectPet', { key: item.key });
      },
    },
  };
</script>
