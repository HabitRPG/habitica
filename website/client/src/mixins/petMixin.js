import notifications from './notifications';

export default {
  mixins: [notifications],
  methods: {
    closeHatchPetDialog () {
      this.$root.$emit('bv::hide::modal', 'hatching-modal');
    },
    hatchPet (pet) {
      this.closeHatchPetDialog();

      this.$store.dispatch('common:hatch', { egg: pet.eggKey, hatchingPotion: pet.potionKey });
      this.text(this.$t('hatchedPet', { egg: pet.eggName, potion: pet.potionName }));
    },
  },
};
