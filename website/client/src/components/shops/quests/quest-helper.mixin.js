import { mapState } from '../../../libs/store';

export const QuestHelperMixin = {
  computed: {
    ...mapState({
      content: 'content',
    }),
  },
  methods: {
    getDropIcon (drop) {
      switch (drop.type) {
        case 'armor':
          return `shop_${drop.key}`;
        case 'hatchingPotions':
          return `Pet_HatchingPotion_${drop.key}`;
        case 'food':
          return `Pet_Food_${drop.key}`;
        case 'eggs':
          return `Pet_Egg_${drop.key}`;
        case 'quests':
          return `inventory_quest_scroll_${drop.key}`;
        default:
          return '';
      }
    },
    getDropName (drop) {
      return drop.text();
    },
    getDropsList (drops, ownerOnly) {
      if (!drops) return [];

      return drops.filter(drop => {
        if (ownerOnly) {
          return drop.onlyOwner;
        }
        return !drop.onlyOwner;
      }).map(item => {
        if (item.type === 'gear') {
          console.info(this.content.gear.flat);

          const contentItem = this.content.gear.flat[item.key];

          console.info({ contentItem, item });

          return contentItem;
        }

        return item;
      });
    },
  },
};
