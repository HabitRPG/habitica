<template lang="pug">
  router-link.leader(
  :to="{'name': 'userProfile', 'params': {'userId': id}}",
  :class='levelStyle()',
  v-b-tooltip.hover.top="tierTitle",
  v-if='displayName')
    | {{displayName}}
    .svg-icon(v-html="tierIcon()")
</template>

<style scoped lang="scss">
  @import '~client/assets/scss/colors.scss';

  a.no-tier {
    color: $gray-50;
  }

  a.leader { // this is the user name
    font-family: 'Roboto Condensed', sans-serif;
    font-weight: bold;
    margin-bottom: 0;
    cursor: pointer;
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

  import styleHelper from 'client/mixins/styleHelper';

  import achievementsLib from '../../common/script/libs/achievements';

  import tier1 from 'assets/svg/tier-1.svg';
  import tier2 from 'assets/svg/tier-2.svg';
  import tier3 from 'assets/svg/tier-3.svg';
  import tier4 from 'assets/svg/tier-4.svg';
  import tier5 from 'assets/svg/tier-5.svg';
  import tier6 from 'assets/svg/tier-6.svg';
  import tier7 from 'assets/svg/tier-7.svg';
  import tier8 from 'assets/svg/tier-mod.svg';
  import tier9 from 'assets/svg/tier-staff.svg';
  import tierNPC from 'assets/svg/tier-npc.svg';

  export default {
    props: ['user', 'userId', 'name', 'backer', 'contributor'],
    mixins: [styleHelper],
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
        } else if (this.user && this.user.profile) {
          return this.user.profile.name;
        }
      },
      level () {
        if (this.contributor) {
          return this.contributor.level;
        } else if (this.user && this.user.contributor) {
          return this.user.contributor.level;
        }
        return 0;
      },
      isNPC () {
        if (this.backer) {
          return this.backer.level;
        } else if (this.user && this.user.backer) {
          return this.user.backer.level;
        }
        return false;
      },
      id () {
        return this.userId || this.user._id;
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
        return achievementsLib.getContribText(this.contributor, this.isNPC) || '';
      },
      levelStyle () {
        return this.userLevelStyleFromLevel(this.level, this.isNPC);
      },
    },
  };
</script>
