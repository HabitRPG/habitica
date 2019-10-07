<template lang="pug">
.face-avatar(:style="{width, height}")
  .character-sprites
    // Buffs that cause visual changes to avatar: Snowman, Ghost, Flower, etc
    template(v-for="(klass, item) in visualBuffs")
      span(v-if="member.stats.buffs[item] && showVisualBuffs", :class="klass")

    // Show flower ALL THE TIME!!!
    // See https://github.com/HabitRPG/habitica/issues/7133
    span(:class="'hair_flower_' + member.preferences.hair.flower")

    // Show avatar only if not currently affected by visual buff
    template(v-if="showAvatar()")
      span(:class="[skinClass]")
      span(:class="['head_0']")
      template(v-for="type in ['bangs', 'base', 'mustache', 'beard']")
        span(:class="['hair_' + type + '_' + member.preferences.hair[type] + '_' + member.preferences.hair.color]")
      span(:class="[getGearClass('eyewear')]")
      span(:class="[getGearClass('head')]")
      span(:class="[getGearClass('headAccessory')]")
      span(:class="['hair_flower_' + member.preferences.hair.flower]")

    // Resting
    span.zzz(v-if="member.preferences.sleep")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .face-avatar {
    width: 36px;
    height: 36px;
    border: solid 2px currentColor;
    border-radius: 18px;
    image-rendering: pixelated;
    position: relative;
    overflow: hidden;
  }

  .character-sprites {
    width: 90px;
    height: 90px;
    margin: -25px -41px;
  }

  .character-sprites span {
    position: absolute;
  }
</style>

<script>
import { mapState } from 'client/libs/store';

export default {
  components: {
  },
  props: {
    member: {
      type: Object,
      required: true,
    },
    avatarOnly: {
      type: Boolean,
      default: false,
    },
    hideClassBadge: {
      type: Boolean,
      default: false,
    },
    withBackground: {
      type: Boolean,
    },
    overrideAvatarGear: {
      type: Object,
    },
    width: {
      type: Number,
      default: 140,
    },
    height: {
      type: Number,
      default: 147,
    },
    spritesMargin: {
      type: String,
      default: '0 auto 0 24px',
    },
    overrideTopPadding: {
      type: String,
    },
    showVisualBuffs: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState({
      flatGear: 'content.gear.flat',
    }),
    hasClass () {
      return this.$store.getters['members:hasClass'](this.member);
    },
    isBuffed () {
      return this.$store.getters['members:isBuffed'](this.member);
    },
    backgroundClass () {
      let background = this.member.preferences.background;

      let allowToShowBackground = !this.avatarOnly || this.withBackground;

      if (this.overrideAvatarGear && this.overrideAvatarGear.background) {
        return `background_${this.overrideAvatarGear.background}`;
      }

      if (background && allowToShowBackground) {
        return `background_${this.member.preferences.background}`;
      }

      return '';
    },
    visualBuffs () {
      return {
        snowball: 'snowman',
        spookySparkles: 'ghost',
        shinySeed: `avatar_floral_${this.member.stats.class}`,
        seafoam: 'seafoam_star',
      };
    },
    skinClass () {
      let baseClass = `skin_${this.member.preferences.skin}`;

      return `${baseClass}${this.member.preferences.sleep ? '_sleep' : ''}`;
    },
    costumeClass () {
      return this.member.preferences.costume ? 'costume' : 'equipped';
    },
  },
  methods: {
    getGearClass (gearType) {
      let result = this.member.items.gear[this.costumeClass][gearType];

      if (this.overrideAvatarGear && this.overrideAvatarGear[gearType]) {
        result = this.overrideAvatarGear[gearType];
      }

      return result;
    },
    showAvatar () {
      if (!this.showVisualBuffs)
        return true;

      let buffs = this.member.stats.buffs;

      return !buffs.snowball && !buffs.spookySparkles && !buffs.shinySeed && !buffs.seafoam;
    },
  },
};
</script>
