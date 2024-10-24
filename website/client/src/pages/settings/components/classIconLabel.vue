<template>
  <div
    class="class-value"
    :class="{[selectedClass]: !classDisabled, disabled: classDisabled}"
  >
    <span
      v-if="!classDisabled"
      class="svg-icon icon-16 mr-2"
      v-html="classIcons[selectedClass]"
    ></span>

    <span
      v-if="classDisabled"
      class="label"
    >
      {{ $t('noClassSelected') }}
    </span>
    <span
      v-else
      class="label"
    >
      {{ $t(selectedClass) }}
    </span>
  </div>
</template>

<script>
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';

export default {
  name: 'ClassIconLabel',
  props: ['selectedClass', 'classDisabled'],
  data () {
    return {
      classIcons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.class-value {
  display: flex;
  align-items: center;

  &:not(.disabled) {
    .label {
      font-weight: bold;
      line-height: 1.71;
    }
  }
}

.healer {
  color: $healer-color;
}

.rogue {
  color: $rogue-color;
}

.warrior {
  color: $warrior-color;
}

.wizard {
  color: $wizard-color;
}

.disabled {
  color: $maroon-50;
}

.label {
  font-size: 14px;
  line-height: 1.71;
  text-align: center;
}
</style>
