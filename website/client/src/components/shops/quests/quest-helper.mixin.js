import groupBy from 'lodash/groupBy';
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
        case 'hatchingPotions':
          return `Pet_HatchingPotion_${drop.key}`;
        case 'food':
          return `Pet_Food_${drop.key}`;
        case 'eggs':
          return `Pet_Egg_${drop.key}`;
        case 'quests':
          return `inventory_quest_scroll_${drop.key}`;
        case 'mounts':
          return `rewards_mount Mount_Icon_${drop.key}`;
        case 'pets':
          return `rewards_pet Pet-${drop.key}`;
        default:
          return `shop_${drop.key}`;
      }
    },
    getDropName (drop) {
      return typeof drop.text === 'function' ? drop.text() : drop.text;
    },
    getDropsList (drops, ownerOnly) {
      if (!drops) return [];

      const dropList = drops.filter(drop => {
        if (ownerOnly) {
          return drop.onlyOwner;
        }
        return !drop.onlyOwner;
      }).map(item => {
        if (item.type === 'gear') {
          const contentItem = this.content.gear.flat[item.key];

          return contentItem;
        }

        return {
          ...item,
          text: item.text(),
        };
      });

      return Object.entries(groupBy(dropList, e => `${e.type}_${e.key}`))
        .map(([, entries]) => ({
          ...entries[0],
          amount: entries.length,
        }));
    },
  },
};
