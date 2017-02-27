<template lang="pug">
.ui.grid
  .four.wide.column
    h2 Pets
    ul
      li(v-for="pet in listAnimals('pet', content.dropEggs, content.dropHatchingPotions)") {{pet}}

  .four.wide.column
    h2 Magic Potions Pets
    ul
      li(v-for="pet in listAnimals('pet', content.dropEggs, content.premiumHatchingPotions)") {{pet}}

  .four.wide.column
    h2 Quest Pets
    ul
      li(v-for="pet in listAnimals('pet', content.questEggs, content.dropHatchingPotions)") {{pet}}

  //.four.wide.column
    h2 Rare Pets
    ul
      li(v-for="pet in listAnimals('pet', content.dropEggs, content.dropHatchingPotions)") {{pet}}

    ul.row Mounts
    ul.row Quest Mounts
    ul.row Rare Mounts

</template>

<script>
import { mapState } from '../../store';
import { each } from 'lodash';

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
