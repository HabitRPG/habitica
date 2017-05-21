<template lang="pug">
  .row
    .col-2.standard-sidebar
      .form-group
        input.form-control.input-search(type="text", :placeholder="$t('search')")

      .form
        h2(v-once) {{ $t('filter') }}
        h3(v-once) {{ $t('pets') }}
        .form-group
          .form-check
            label.custom-control.custom-checkbox(v-for="petGroup in petGroups", :key="petGroup.key", v-once)
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
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('hatchingPotions') }}
            label.custom-control.custom-checkbox(v-once)
              input.custom-control-input(type="checkbox")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t('quest') }}
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
          :itemContentClass="'Pet-' + pet.key",
          :key="pet.key",
          :showPopover="true",
          :label="pet.value",
          :popoverPosition="'top'",
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

  .item .item-content {
    position: absolute;
    top: -18px;
    right: inherit;
    display: block;
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
      ...mapState(['content']),

      petGroups () {
        let petGroups = [
          {
            label: 'Standard',
            key: 'standardPets',
            petSource: {
              eggs: this.content.dropEggs,
              potions: this.content.dropHatchingPotions,
            },
          },
          {
            label: this.$t('magicPets'),
            key: 'magicPets',
            petSource: {
              eggs: this.content.dropEggs,
              potions: this.content.premiumHatchingPotions,
            },
          },
          {
            label: this.$t('questPets'),
            key: 'questPets',
            petSource: {
              eggs: this.content.questEggs,
              potions: this.content.dropHatchingPotions,
            },
          },
          {
            label: this.$t('rarePets'),
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
              pet: this.content[`${type}Info`][animalKey].text(),
            });
          });
        });

        return animals;
      },
      pets (petGroup, showAll) {
        return this.listAnimals('pet', petGroup.petSource.eggs, petGroup.petSource.potions, showAll);
      },
    },
  };
</script>
