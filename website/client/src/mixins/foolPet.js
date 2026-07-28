export default {
  methods: {
    foolPet (pet, substitutions) {
      if (!pet || pet === 'Pet-') return substitutions.noPet;
      if (substitutions[pet]) return substitutions[pet];
      for (const key in substitutions) {
        if (pet.startsWith(key)) {
          return substitutions[key];
        }
      }
      return substitutions.default;
    },
  },
};
