<template>
  <div
    v-if="displayName"
    v-b-tooltip.hover.top="tierTitle"
    class="user-label"
    :class="levelStyle()"
  >
    {{ displayName }}
    <div
      v-if="hasTier"
      class="svg-icon"
      v-html="tierIcon()"
    ></div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .user-label.no-tier {
    color: $gray-50;
  }

  .user-label {
    font-weight: bold;
    margin-bottom: 0;
    display: inline-block;
    font-size: 16px;

    .svg-icon {
      width: 10px;
      display: inline-block;
      margin-left: .5em;
    }
  }
</style>

<script>
import achievementsLib from '@/../../common/script/libs/achievements';

import styleHelper from '@/mixins/styleHelper';

import tier1 from '@/assets/svg/tier-1.svg';
import tier2 from '@/assets/svg/tier-2.svg';
import tier3 from '@/assets/svg/tier-3.svg';
import tier4 from '@/assets/svg/tier-4.svg';
import tier5 from '@/assets/svg/tier-5.svg';
import tier6 from '@/assets/svg/tier-6.svg';
import tier7 from '@/assets/svg/tier-7.svg';
import tier8 from '@/assets/svg/tier-mod.svg';
import tier9 from '@/assets/svg/tier-staff.svg';
import tierNPC from '@/assets/svg/tier-npc.svg';

export default {
  mixins: [styleHelper],
  props: ['user', 'name', 'backer', 'contributor', 'hideTooltip'],
  data () {
    return {
      icons: Object.freeze({
        tier1,
        tier2,
        tier3,
        tier4,
        tier5,
        tier6,
        tier7,
        tier8,
        tier9,
        tierNPC,
      }),
    };
  },
  computed: {
    displayName () {
      if (this.name) {
        return this.name;
      }
      if (this.user && this.user.profile) {
        return this.user.profile.name;
      }

      return null;
    },
    level () {
      if (this.contributor) {
        return this.contributor.level;
      } if (this.user && this.user.contributor) {
        return this.user.contributor.level;
      }
      return 0;
    },
    isNPC () {
      if (this.backer) {
        return this.backer.tier === 800;
      } if (this.user && this.user.backer) {
        return this.user.backer.tier === 800;
      }

      return false;
    },
    hasTier () {
      return this.isNPC || this.level !== 0;
    },
  },
  methods: {
    tierIcon () {
      if (this.isNPC) {
        return this.icons.tierNPC;
      }
      return this.icons[`tier${this.level}`];
    },
    tierTitle () {
      return this.hideTooltip ? '' : achievementsLib.getContribText(this.contributor, this.isNPC) || '';
    },
    levelStyle () {
      return this.userLevelStyleFromLevel(this.level, this.isNPC);
    },
  },
};
</script>
