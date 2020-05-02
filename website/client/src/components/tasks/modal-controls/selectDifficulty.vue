<template>
  <div>
    <select-list :items="items"
                 :key-prop="'icon'"
                 class="difficulty-select"
                 :value="selected"
                 @select="$emit('select', $event.value)">
      <template v-slot:item="{ item }">
        <div v-if="item" class="difficulty-item">
          <span class="label">{{ item.label }}</span>

          <div class="svg-icon" >
            <span v-for="n in item.stars"
                  v-html="icons.difficultyTrivial"
            :key="n">

            </span>
          </div>
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

  .label {
    flex: 1;
  }

  div.svg-icon {
    flex-grow: 0;
    width: 80px;
    display: flex;
    justify-content: flex-end;
    margin-left: 0.375rem;

    span {
      display: inline;
    }

    ::v-deep svg {
      margin-left: 0.125rem;
      width: 0.625rem;
      height: 0.625rem;
      object-fit: contain;

      fill: var(--svg-color);
    }
  }
</style>

<style lang="scss">
  .difficulty-select {
    // restyle the selected item
    .dropdown-toggle {

      .label {
      flex: 0;
    }

    div.svg-icon {
      justify-content: flex-start;
    }
    }
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
    const items = [
      {
        value: 0.1,
        label: this.$t('trivial'),
        stars: 1,
      },
      {
        value: 1,
        label: this.$t('easy'),
        stars: 2,
      },
      {
        value: 1.5,
        label: this.$t('medium'),
        stars: 3,
      },
      {
        value: 2,
        label: this.$t('hard'),
        stars: 4,
      },
    ];

    return {
      items,
      icons: Object.freeze({
        difficultyNormal: difficultyNormalIcon,
        difficultyTrivial: difficultyTrivialIcon,
        difficultyMedium: difficultyMediumIcon,
        difficultyHard: difficultyHardIcon,
      }),
      selected: items.find(i => i.value === this.value),
    };
  },
  props: {
    value: {
      type: Number,
    },
  },
};
</script>
