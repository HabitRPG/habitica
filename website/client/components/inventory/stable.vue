<template lang="pug">
.row
  .col-2.standard-sidebar
    .form-group
      input.form-control(type="text", :placeholder="$t('search')")

    .form
      h3(v-once) {{ $t('filter') }}
      .form-group
        .form-check
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            strong {{ $t('pets') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('hatchingPotions') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('quest') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('special') }}
      .form-group
        .form-check
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            strong {{ $t('mounts') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('hatchingPotions') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('quest') }}
        .form-check.nested-field
          label.form-check-label(v-once) 
            input.form-check-input(type="checkbox")
            span {{ $t('special') }}

  .col-10.standard-page
    h4 Pets
    .inventory-item-container(v-for="pet in dropPets")
      .PixelPaw
    .btn.btn-secondary.d-block(@click="open.dropPets = !open.dropPets") {{ open.dropPets ? 'Close' : 'Open' }}

    h2 Magic Potions Pets
    .inventory-item-container(v-for="pet in magicPets")
      .PixelPaw
    .btn.btn-secondary.d-block(@click="open.magicPets = !open.magicPets") {{ open.magicPets ? 'Close' : 'Open' }}

    h2 Quest Pets
    .inventory-item-container(v-for="pet in questPets")
      .PixelPaw
    .btn.btn-secondary.d-block(@click="open.questPets = !open.questPets") {{ open.questPets ? 'Close' : 'Open' }}

    h2 Rare Pets
    .inventory-item-container(v-for="pet in rarePets")
      .PixelPaw
    .btn.btn-secondary.d-block(@click="open.rarePets = !open.rarePets") {{ open.rarePets ? 'Close' : 'Open' }}

    h2 Mounts
    h2 Quest Mounts
    h2 Rare Mounts
</template>

<style lang="scss">
.inventory-item-container {
  padding: 20px;
  border: 1px solid;
  display: inline-block;
}
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';

// TODO Normalize special pets and mounts
// import Store from 'client/store';
// import deepFreeze from 'client/libs/deepFreeze';
// const specialMounts =

export default {
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
          animals.push(this.content[`${type}Info`][animalKey].text());
        });
      });

      return animals;
    },
  },
};
</script>
