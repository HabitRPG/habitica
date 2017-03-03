<template lang="pug">
.ui.grid
  .three.wide.column
    .ui.left.icon.input
      i.search.icon
      input(type="text", :placeholder="$t('search')")
    h3(v-once) {{ $t('filter') }}

    .ui.form
      .field
        .ui.checkbox
          input(type='checkbox')
          label.label-primary(v-once) {{ $t('pets') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('hatchingPotions') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('quest') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('special') }}
      .field
        .ui.checkbox
          input(type='checkbox')
          label.label-primary(v-once) {{ $t('mounts') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('hatchingPotions') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('quest') }}
      .field.nested-field
        .ui.checkbox
          input(type='checkbox')
          label(v-once) {{ $t('special') }}

  .thirteen.wide.column
    h2 Pets
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

<style>
.label-primary {
  font-weight: bold;
}

.nested-field {
  padding-left: 1.5rem;
}

.inventory-item-container {
  padding: 20px;
  border: 1px solid;
  display: inline-block;
}
</style>

<script>
import { mapState } from '../../store';
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
