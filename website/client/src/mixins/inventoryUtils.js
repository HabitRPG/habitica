export default {
  methods: {
    getItemClass (type, itemKey) {
      switch (type) {
        case 'food':
        case 'special':
          return `Pet_Food_${itemKey}`;
        case 'eggs':
          return `Pet_Egg_${itemKey}`;
        case 'hatchingPotions':
          return `Pet_HatchingPotion_${itemKey}`;
        default:
          return '';
      }
    },
    getItemName (type, item) {
      switch (type) {
        case 'eggs':
          return this.$t('egg', { eggType: item.text() });
        case 'hatchingPotions':
          return this.$t('potion', { potionType: item.text() });
        default:
          return item.text();
      }
    },
  },
};
