<template lang="pug">
.avatar(:style="{width, height, paddingTop}", :class="backgroundClass", @click.prevent='castEnd()')
  .character-sprites(:style='{margin: spritesMargin}')
    template(v-if="!avatarOnly")
      // Mount Body
      span(v-if="member.items.currentMount", :class="'Mount_Body_' + member.items.currentMount")

    // Buffs that cause visual changes to avatar: Snowman, Ghost, Flower, etc
    template(v-for="(klass, item) in visualBuffs")
      span(v-if="member.stats.buffs[item] && showVisualBuffs", :class="klass")

    // Show flower ALL THE TIME!!!
    // See https://github.com/HabitRPG/habitica/issues/7133
    span(:class="'hair_flower_' + member.preferences.hair.flower")

    // Show avatar only if not currently affected by visual buff
    template(v-if="showAvatar()")
      span(:class="'chair_' + member.preferences.chair")
      span(:class="getGearClass('back')")
      span(:class="skinClass")
      span(:class="member.preferences.size + '_shirt_' + member.preferences.shirt")
      span.head_0
      span(:class="member.preferences.size + '_' + getGearClass('armor')")
      span.head_0
      span(:class="getGearClass('back_collar')")
      span(:class="getGearClass('body')")
      template(v-for="type in ['bangs', 'base', 'mustache', 'beard']")
        span(:class="'hair_' + type + '_' + member.preferences.hair[type] + '_' + member.preferences.hair.color")
      span(:class="getGearClass('eyewear')")
      span(:class="getGearClass('head')")
      span(:class="getGearClass('headAccessory')")
      span(:class="'hair_flower_' + member.preferences.hair.flower")
      span(v-if="!hideGear('shield')", :class="getGearClass('shield')")
      span(v-if="!hideGear('weapon')", :class="getGearClass('weapon')")

    // Resting
    span.zzz(v-if="member.preferences.sleep")

    template(v-if="!avatarOnly")
      // Mount Head
      span(v-if="member.items.currentMount", :class="'Mount_Head_' + member.items.currentMount")
      // Pet
      span.current-pet(v-if="member.items.currentPet", :class="'Pet-' + member.items.currentPet")
  class-badge.under-avatar(v-if="hasClass && !hideClassBadge", :member-class="member.stats.class")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .avatar {
    width: 140px;
    height: 147px;
    image-rendering: pixelated;
    position: relative;
    cursor: pointer;
  }

  .character-sprites {
    width: 90px;
    height: 90px;
  }

  .character-sprites span {
    position: absolute;
  }

  .current-pet {
    bottom: 0px;
    left: 0px;
  }
</style>

<script>
import { mapState } from 'client/libs/store';

import ClassBadge from 'client/components/members/classBadge';

export default {
  components: {
    ClassBadge,
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
    paddingTop () {
      if (this.overrideTopPadding) {
        return this.overrideTopPadding;
      }

      let val = '28px';

      if (!this.avatarOnly) {
        if (this.member.items.currentPet) val = '24.5px';
        if (this.member.items.currentMount) val = '0px';
      }

      return val;
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
    hideGear (gearType) {
      if (gearType === 'weapon') {
        let equippedWeapon = this.member.items.gear[this.costumeClass][gearType];

        if (!equippedWeapon) {
          return false;
        }

        let equippedIsTwoHanded = this.flatGear[equippedWeapon].twoHanded;
        let hasOverrideShield = this.overrideAvatarGear && this.overrideAvatarGear.shield;

        return equippedIsTwoHanded && hasOverrideShield;
      } else if (gearType === 'shield') {
        let overrideWeapon = this.overrideAvatarGear && this.overrideAvatarGear.weapon;
        let overrideIsTwoHanded = overrideWeapon && this.flatGear[overrideWeapon].twoHanded;

        return overrideIsTwoHanded;
      }
    },
    castEnd (e) {
      if (!this.$store.state.spellOptions.castingSpell) return;
      this.$root.$emit('castEnd', this.member, 'user', e);
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
