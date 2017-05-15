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


    h2 Pets
    h4 Standard

    .items
      item(
      v-for="pet in dropPets",
      :item="pet",
      :key="pet.key",
      :showPopover="true",
      :label="pet.value",
      :popoverPosition="'top'",
      )
        span(slot="popoverContent") {{ pet }}
        div(slot="itemContent", :class="'Pet-' + pet.key")

    .btn.btn-show-more(@click="open.dropPets = !open.dropPets") {{ open.dropPets ? 'Close' : 'Open' }}

    h4 Magic Potions Pets
    .inventory-item-container(v-for="pet in magicPets")
      .PixelPaw
    .btn.btn-show-more(@click="open.magicPets = !open.magicPets") {{ open.magicPets ? 'Close' : 'Open' }}

    h4 Quest Pets
    .inventory-item-container(v-for="pet in questPets")
      .PixelPaw
    .btn.btn-show-more(@click="open.questPets = !open.questPets") {{ open.questPets ? 'Close' : 'Open' }}

    h4 Rare Pets
    .inventory-item-container(v-for="pet in rarePets")
      .PixelPaw
    .btn.btn-show-more(@click="open.rarePets = !open.rarePets") {{ open.rarePets ? 'Close' : 'Open' }}

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

.item.item-content {
  position: absolute;
  top: -18px;
  right: 5px;
  display: block;
}
</style>

<script>
import { mapState } from 'client/libs/store';

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
      open: {
        dropPets: false,
        magicPets: false,
        questPets: false,
        rarePets: false,
      },
    };
  },
  computed: {
    ...mapState(['content']),
    dropPets () {
      return this.listAnimals('pet', this.content.dropEggs, this.content.dropHatchingPotions, this.open.dropPets);
    },
    magicPets () {
      return this.listAnimals('pet', this.content.dropEggs, this.content.premiumHatchingPotions, this.open.magicPets);
    },
    questPets () {
      return this.listAnimals('pet', this.content.questEggs, this.content.dropHatchingPotions, this.open.questPets);
    },
    rarePets () {
      return this.listAnimals('pet', this.content.dropEggs, this.content.dropHatchingPotions, this.open.rarePets);
    },
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
  },
};
</script>
