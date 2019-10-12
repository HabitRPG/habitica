<template>
  <div class="class-badge d-flex justify-content-center">
    <div
      class="align-self-center svg-icon"
      v-html="icons[memberClass]"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.class-badge {
  $badge-size: 32px;

  width: $badge-size;
  height: $badge-size;
  background: $white;
  box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
  border-radius: 100px;

  &.under-avatar {
    position: absolute;
    left: calc(50% - (16px));
    bottom: -($badge-size / 2);
    z-index: 1;
  }

  .svg-icon {
    width: 19px;
    height: 19px;
  }
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
