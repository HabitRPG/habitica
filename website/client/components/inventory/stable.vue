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
    .inventory-item-container(v-for="pet in listAnimals('pet', content.dropEggs, content.dropHatchingPotions)")
      .PixelPaw

    h2 Magic Potions Pets
    ul
      li(v-for="pet in listAnimals('pet', content.dropEggs, content.premiumHatchingPotions)") {{pet}}

    h2 Quest Pets
    ul
      li(v-for="pet in listAnimals('pet', content.questEggs, content.dropHatchingPotions)") {{pet}}

    h2 Rare Pets
    ul
      li(v-for="pet in listAnimals('pet', content.dropEggs, content.dropHatchingPotions)") {{pet}}

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

export default {
  computed: {
    ...mapState(['content']),
  },
  methods: {
    listAnimals (type, eggSource, potionSource) {
      let animals = [];

      each(eggSource, (egg) => {
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
