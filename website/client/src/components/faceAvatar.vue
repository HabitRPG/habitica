<template>
  <div
    class="face-avatar"
    :style="{width, height}"
  >
    <div class="character-sprites">
      <!-- Buffs that cause visual changes to avatar: Snowman, Ghost, Flower, etc-->
      <template v-for="(klass, item) in visualBuffs">
        <span
          v-if="member.stats.buffs[item] && showVisualBuffs"
          :key="klass"
          :class="klass"
        ></span>
      </template>
      <!-- Show flower ALL THE TIME!!!-->
      <!-- See https://github.com/HabitRPG/habitica/issues/7133-->
      <span :class="'hair_flower_' + member.preferences.hair.flower"></span>
      <!-- Show avatar only if not currently affected by visual buff-->
      <template v-if="showAvatar()">
        <span :class="[skinClass]"></span><span :class="['head_0']"></span>
        <template v-for="type in ['bangs', 'base', 'mustache', 'beard']">
          <span
            :key="type"
            :class="[getHairClass(type)]"
          ></span>
        </template>
        <span :class="[getGearClass('body')]"></span>
        <span :class="[getGearClass('eyewear')]"></span>
        <span :class="[getGearClass('head')]"></span>
        <span :class="[getGearClass('headAccessory')]"></span>
        <span :class="['hair_flower_' + member.preferences.hair.flower]"></span>
      </template>
      <!-- Resting--><span
        v-if="member.preferences.sleep"
        class="zzz"
      ></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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
import { mapState } from '@/libs/store';

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
    visualBuffs () {
      return {
        snowball: `avatar_snowball_${this.member.stats.class}`,
        spookySparkles: 'ghost',
        shinySeed: `avatar_floral_${this.member.stats.class}`,
        seafoam: 'seafoam_star',
      };
    },
    skinClass () {
      const baseClass = `skin_${this.member.preferences.skin}`;

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
      if (!this.showVisualBuffs) return true;

      const { buffs } = this.member.stats;

      return !buffs.snowball && !buffs.spookySparkles && !buffs.shinySeed && !buffs.seafoam;
    },
    getHairClass (type) {
      const hairPref = this.member.preferences.hair;

      return `hair_${type}_${hairPref[type]}_${hairPref.color}`;
    },
  },
};
</script>
