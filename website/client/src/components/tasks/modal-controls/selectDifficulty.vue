<template>
  <div>
    <select-list
      :items="items"
      :key-prop="'icon'"
      class="difficulty-select"
      :class="{disabled: disabled}"
      :disabled="disabled"
      :value="selected"
      :hide-icon="true"
      @select="$emit('select', $event.value)"
    >
      <template v-slot:item="{ item, button }">
        <div
          v-if="item"
          class="difficulty-item"
          :class="{ 'isButton': button }"
        >
          <span class="label">{{ item.label }}</span>

          <div class="svg-icon">
            <span
              v-for="n in item.stars"
              :key="n"
              v-html="icons.difficultyTrivial"
            >

            </span>
          </div>
        </div>
      </template>
    </select-list>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .difficulty-item {
    display: flex;
    align-items: center;
    width: 100%;

    div.svg-icon {
      ::v-deep svg {
        fill: $gray-200;
      }
    }

    &:hover, &.isButton {
      div.svg-icon {
        ::v-deep svg {
          fill: var(--svg-color);
        }
      }
    }
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

      fill: $gray-200;
    }
  }
</style>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .difficulty-select {

    &.disabled {
      .btn-secondary:disabled, .btn-secondary.disabled, .dropdown >
      .btn-secondary.dropdown-toggle:not(.btn-success):disabled, .dropdown >
      .btn-secondary.dropdown-toggle:not(.btn-success).disabled, .show >
      .btn-secondary.dropdown-toggle:not(.btn-success):disabled, .show >
      .btn-secondary.dropdown-toggle:not(.btn-success).disabled {
        background: $gray-700;
      }
    }
    // restyle the selected item
    .dropdown-toggle {

      &.disabled {
        box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);

        &::after {
          color: $gray-300;
          border-top-color: $gray-300;
        }

        .label {
          color: $gray-200;
        }
      }

      .label {
        flex: 0;
      }

      div.svg-icon {
        justify-content: flex-start;
      }
    }

    // highlight the svg icons,
    // when focusing with keyboard (it is outside of the template item
    .dropdown-item:focus .difficulty-item {
      div.svg-icon {
        svg {
          fill: var(--svg-color);
        }
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
  props: {
    disabled: {
      type: Boolean,
    },
    value: {
      type: Number,
    },
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
};
</script>
