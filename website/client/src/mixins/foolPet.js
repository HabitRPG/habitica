export default {
  methods: {
    foolPet (pet, substitutions) {
      console.log(pet);
      if (!pet) return substitutions.noPet;
      for (const key in substitutions) {
        if (pet.startsWith(key)) {
          return substitutions[key];
        }
      }
      return substitutions.default;
    },
  },
};
