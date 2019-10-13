<template>
  <div class="questRewards">
    <h3
      v-once
      class="text-center"
    >
      {{ $t('rewards') }}
    </h3>
    <div class="reward-item">
      <span
        class="svg-icon inline icon"
        v-html="icons.experience"
      ></span>
      <span class="reward-text">{{ $t('amountExperience', { amount: item.drop.exp }) }}</span>
    </div>
    <div
      v-if="item.drop.gp != 0"
      class="reward-item"
    >
      <span
        class="svg-icon inline icon"
        v-html="icons.gold"
      ></span>
      <span class="reward-text">{{ $t('amountGold', { amount: item.drop.gp }) }}</span>
    </div>
    <div
      v-for="drop in getDropsList(item.drop.items, false)"
      :key="drop.key"
      class="reward-item"
    >
      <span class="icon">
        <div :class="getDropIcon(drop)"></div>
      </span>
      <span class="reward-text">{{ getDropName(drop) }}</span>
    </div>
    <div
      v-if="item.drop.unlock"
      class="reward-item text-center"
    >
      <span class="reward-text">{{ item.drop.unlock() }}</span>
    </div>
    <h3
      v-if="getDropsList(item.drop.items, true).length > 0"
      class="text-center"
    >
      {{ $t('questOwnerRewards') }}
    </h3>
    <div
      v-for="drop in getDropsList(item.drop.items, true)"
      :key="drop.key"
      class="reward-item"
    >
      <span class="icon">
        <div :class="getDropIcon(drop)"></div>
      </span>
      <span class="reward-text">{{ getDropName(drop) }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .questRewards {
    overflow-y: auto;
    width: 364px;
    z-index: -1;
    height: 100%;

    h3 {
      margin-top: 24px;
      margin-bottom: 16px;
      margin-left: auto;
      margin-right: auto;
    }

    .reward-item {
      width: 306px;
      height: 84px;
      border-radius: 2px;
      background-color: #ffffff;
      margin: 0 auto;
      margin-bottom: 1em;
      padding: 1em;

      display: flex;
      flex-direction: row;
      align-items: center;

      .icon:not(.svg-icon) {
        height: 68px;
        width: 68px;
      }

      .svg-icon {
        margin: 15px;
        height: 38px;
        width: 38px;
      }

      .reward-text {
        font-weight: bold;
      }
    }
  }
</style>

<script>
import svgGold from '@/assets/svg/gold.svg';
import svgExperience from '@/assets/svg/experience.svg';

export default {
  components: {
  },
  mixins: [],
  props: {
    item: {
      type: Object,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gold: svgGold,
        experience: svgExperience,
      }),
    };
  },
  methods: {
    getDropIcon (drop) {
      switch (drop.type) {
        case 'gear':
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
      });
    },
  },
};
</script>
