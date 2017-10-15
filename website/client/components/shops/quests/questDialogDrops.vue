<template lang="pug">
  div.questRewards
    h3.text-center(v-once) {{ $t('rewards') }}
    div.reward-item
      span.svg-icon.inline.icon(v-html="icons.experience")
      span.reward-text {{ $t('amountExperience', { amount: item.drop.exp }) }}
    div.reward-item(v-if="item.drop.gp != 0")
      span.svg-icon.inline.icon(v-html="icons.gold")
      span.reward-text {{ $t('amountGold', { amount: item.drop.gp }) }}
    div.reward-item(v-for='drop in getDropsList(item.drop.items, false)')
      span.icon
        div(:class="getDropIcon(drop)")
      span.reward-text {{ getDropName(drop) }}
    h3.text-center(v-if='getDropsList(item.drop.items, true).length > 0') {{$t('questOwnerRewards')}}
    div.reward-item(v-for='drop in getDropsList(item.drop.items, true)')
      span.icon
        div(:class="getDropIcon(drop)")
      span.reward-text {{ getDropName(drop) }}
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
  import svgGold from 'assets/svg/gold.svg';
  import svgExperience from 'assets/svg/experience.svg';

  export default {
    mixins: [],
    components: {
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

        return drops.filter(function dropsList (drop) {
          if (ownerOnly) {
            return drop.onlyOwner;
          } else {
            return !drop.onlyOwner;
          }
        });
      },
    },
    props: {
      item: {
        type: Object,
      },
    },
  };
</script>
