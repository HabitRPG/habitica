<template>
  <span
    class="svg-icon"
    :aria-label="$t(memberClass)"
    v-html="icons[memberClass]"
  ></span>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.svg-icon {
  --badge-size: 16px;
  width: var(--badge-size);
  height: var(--badge-size);
}

</style>

<script>
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';

export default {
  props: {
    memberClass: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
    };
  },
};
</script>
