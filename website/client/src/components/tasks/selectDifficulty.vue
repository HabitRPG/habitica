<template>
  <div>
    <select-list :items="items"
                 :key-prop="'icon'">
      <template v-slot:item="{ item }">
        <div v-if="item" class="difficulty-item">
          <span class="inline">{{ item.label }}</span>
          <span
          class="inline svg-icon"
          v-html="icons[item.icon]"
        ></span>
        </div>
      </template>
    </select-list>
  </div>
</template>

<style lang="scss" scoped>
  .difficulty-item {
    display: flex;
    align-items: center;
  }

  .svg-icon {
    margin-left: 1rem;
    height: 16px;
    width: 16px;
  }
</style>

<script>
import difficultyNormalIcon from '@/assets/svg/difficulty-normal.svg';
import difficultyTrivialIcon from '@/assets/svg/difficulty-trivial.svg';
import difficultyMediumIcon from '@/assets/svg/difficulty-medium.svg';
import difficultyHardIcon from '@/assets/svg/difficulty-hard.svg';
import selectList from '@/components/ui/selectList';


export default {
  components: {
    selectList,
  },
  data () {
    return {
      items: [
        {
          value: 0.1,
          label: this.$t('trivial'),
          icon: 'difficultyTrivial',
        },
        {
          value: 1,
          label: this.$t('normal'),
          icon: 'difficultyNormal',
        },
        {
          value: 1.5,
          label: this.$t('medium'),
          icon: 'difficultyMedium',
        },
        {
          value: 2,
          label: this.$t('hard'),
          icon: 'difficultyHard',
        },
      ],
      icons: Object.freeze({
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
      }),
    };
  },
  props: {},
};
</script>
