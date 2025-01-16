<template>
  <div class="avatar-wrapper">
    <div
      v-if="member.preferences"
      class="avatar"
      :style="{width, height, paddingTop}"
      :class="topLevelClassList"
      @click.prevent="castEnd()"
    >
      <div
        class="character-sprites"
        :style="{margin: spritesMargin}"
      >
        <template v-if="!avatarOnly">
          <!-- Mount Body-->
          <span
            v-if="member.items.currentMount"
            :class="'Mount_Body_' + member.items.currentMount"
          ></span>
        </template>
        <!-- Buffs that cause visual changes to avatar: Snowman, Ghost, Flower, etc-->
        <template v-for="(klass, item) in visualBuffs">
          <span
            v-if="member.stats.buffs[item] && showVisualBuffs"
            :key="item"
            :class="klass"
          ></span>
        </template>
        <!-- Show flower ALL THE TIME!!!-->
        <!-- See https://github.com/HabitRPG/habitica/issues/7133-->
        <span :class="'hair_flower_' + member.preferences.hair.flower"></span>
        <!-- Show avatar only if not currently affected by visual buff-->
        <template v-if="showAvatar()">
          <span :class="['chair_' + member.preferences.chair, specialMountClass]"></span>
          <span :class="[getGearClass('back'), specialMountClass]"></span>
          <span :class="[skinClass, specialMountClass]"></span>
          <!-- eslint-disable max-len-->
          <span
            :class="[shirtClass, specialMountClass]"
          ></span>
          <!-- eslint-enable max-len-->
          <span :class="['head_0', specialMountClass]"></span>
          <!-- eslint-disable max-len-->
          <span :class="[member.preferences.size + '_' + getGearClass('armor'), specialMountClass]"></span>
          <!-- eslint-enable max-len-->
          <span :class="[getGearClass('back_collar'), specialMountClass]"></span>
          <template
            v-for="type in ['bangs', 'base', 'mustache', 'beard']"
          >
            <span
              :key="type"
              :class="[hairClass(type), specialMountClass]"
            ></span>
          </template>
          <span :class="[getGearClass('body'), specialMountClass]"></span>
          <span :class="[getGearClass('eyewear'), specialMountClass]"></span>
          <span :class="[getGearClass('head'), specialMountClass]"></span>
          <span :class="[getGearClass('headAccessory'), specialMountClass]"></span>
          <span
            :class="[
              'hair_flower_' + member.preferences.hair.flower, specialMountClass
            ]"
          ></span>
          <span
            v-if="!hideGear('shield')"
            :class="[getGearClass('shield'), specialMountClass]"
          ></span>
          <span
            v-if="!hideGear('weapon')"
            :class="[getGearClass('weapon'), specialMountClass]"
            class="weapon"
          ></span>
        </template>
        <!-- Resting-->
        <span
          v-if="member.preferences.sleep"
          class="zzz"
        ></span>
        <template v-if="!avatarOnly">
          <!-- Mount Head-->
          <span
            v-if="member.items.currentMount"
            :class="'Mount_Head_' + member.items.currentMount"
          ></span>
          <!-- Pet-->
          <span
            class="current-pet"
            :class="petClass"
          ></span>
        </template>
      </div>
      <class-badge
        v-if="hasClass && !hideClassBadge"
        class="under-avatar"
        :member-class="member.stats.class"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .avatar {
    width: 141px;
    image-rendering: pixelated;
    position: relative;
    cursor: pointer;

    &.centered-avatar {
      margin: 0 auto;
    }

    // resetting the additional padding
    margin-bottom: -0.5rem !important;
  }

  .character-sprites {
    width: 90px;
    height: 90px;

    display: inline-flex;
  }

  .character-sprites span {
    position: absolute;
  }

  .current-pet {
    bottom: 0px;
    left: 0px;
  }

  .offset-kangaroo {
    margin-top: 24px;
  }

  .invert {
    filter: invert(100%);
  }

  .weapon {
     // the only one that is relative so that it fits into the parent div
    position: relative !important;
  }

  .debug {
    border: 1px solid red;

    .character-sprites {
      border: 1px solid blue;
    }

    .weapon {
      border: 1px solid green;
    }

    span {
      border: 1px solid yellow;
    }
  }
</style>

<script>
import some from 'lodash/some';
import moment from 'moment';
import { mapState } from '@/libs/store';
import foolPet from '../mixins/foolPet';

import ClassBadge from '@/components/members/classBadge';

/**
 * TODO replace avatarOnly with multiple options like
 *    - showMount
 *    - showPet
 *    - showBackground
 *    - showWeapons
 */

export default {
  components: {
    ClassBadge,
  },
  mixins: [foolPet],
  props: {
    debugMode: {
      type: Boolean,
      default: false,
    },
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
      default (data) {
        return data;
      },
    },
    width: {
      type: String,
      default: '140px',
    },
    height: {
      type: String,
      default: undefined,
    },
    centerAvatar: {
      type: Boolean,
      default: false,
    },
    spritesMargin: {
      type: String,
      default: '0 auto 0 24px',
    },
    overrideTopPadding: {
      type: String,
      default: null,
    },
    showVisualBuffs: {
      type: Boolean,
      default: true,
    },
    showWeapon: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState({
      flatGear: 'content.gear.flat',
      currentEventList: 'worldState.data.currentEventList',
    }),
    hasClass () {
      if (!this.member) return false;
      return this.$store.getters['members:hasClass'](this.member);
    },
    isBuffed () {
      if (!this.member) return false;
      return this.$store.getters['members:isBuffed'](this.member);
    },
    paddingTop () {
      if (this.overrideTopPadding) {
        return this.overrideTopPadding;
      }

      let val = '24px';

      if (!this.avatarOnly) {
        if (this.member?.items.currentPet) val = '24px';
        if (this.member?.items.currentMount) val = '0px';
      }

      return val;
    },
    topLevelClassList () {
      const classes = [this.backgroundClass];

      if (this.debugMode) {
        classes.push('debug');
      }

      if (this.centerAvatar) {
        classes.push('centered-avatar');
      }

      return classes.join(' ');
    },
    backgroundClass () {
      if (this.member) {
        const { background } = this.member.preferences;

        const allowToShowBackground = !this.avatarOnly || this.withBackground;

        if (this.overrideAvatarGear && this.overrideAvatarGear.background) {
          return `background_${this.overrideAvatarGear.background}`;
        }

        if (background && allowToShowBackground) {
          return `background_${this.member.preferences.background}`;
        }
      }
      return '';
    },
    visualBuffs () {
      if (!this.member) return {};
      return {
        snowball: `avatar_snowball_${this.member.stats.class}`,
        spookySparkles: 'ghost',
        shinySeed: `avatar_floral_${this.member.stats.class}`,
        seafoam: 'seafoam_star',
      };
    },
    skinClass () {
      if (!this.member) return '';
      if (this.overrideAvatarGear?.skin) {
        return `skin_${this.overrideAvatarGear.skin}`;
      }
      const baseClass = `skin_${this.member.preferences.skin}`;

      return `${baseClass}${this.member.preferences.sleep ? '_sleep' : ''}`;
    },
    shirtClass () {
      if (!this.member) return '';
      if (this.overrideAvatarGear?.shirt) {
        return `${this.member.preferences.size}_shirt_${this.overrideAvatarGear.shirt}`;
      }
      return `${this.member.preferences.size}_shirt_${this.member.preferences.shirt}`;
    },
    costumeClass () {
      return this.member?.preferences.costume ? 'costume' : 'equipped';
    },
    specialMountClass () {
      if (!this.avatarOnly && this.member?.items.currentMount && this.member?.items.currentMount.includes('Kangaroo')) {
        return 'offset-kangaroo';
      }

      return null;
    },
    petClass () {
      if (some(
        this.currentEventList,
        event => moment().isBetween(event.start, event.end) && event.aprilFools && event.aprilFools === 'Fungi',
      )) {
        return this.foolPet(this.member.items.currentPet);
      }
      if (this.member?.items.currentPet) return `Pet-${this.member.items.currentPet}`;
      return '';
    },
  },
  methods: {
    getGearClass (gearType) {
      if (!this.member) return '';
      let result = this.member.items.gear[this.costumeClass][gearType];

      if (this.overrideAvatarGear && this.overrideAvatarGear[gearType]) {
        result = this.overrideAvatarGear[gearType];
      }

      return result;
    },
    hairClass (slot) {
      if (this.overrideAvatarGear?.hair) {
        if (this.overrideAvatarGear.hair[slot]) {
          return `hair_${slot}_${this.overrideAvatarGear.hair[slot]}_${this.member.preferences.hair.color}`;
        }
        if (this.overrideAvatarGear.hair.color) {
          return `hair_${slot}_${this.member.preferences.hair[slot]}_${this.overrideAvatarGear.hair.color}`;
        }
      }
      return `hair_${slot}_${this.member.preferences.hair[slot]}_${this.member.preferences.hair.color}`;
    },
    hideGear (gearType) {
      if (!this.member) return true;
      if (!this.showWeapon) {
        return true;
      }

      if (gearType === 'weapon') {
        const equippedWeapon = this.member.items.gear[this.costumeClass][gearType];

        if (!equippedWeapon) {
          return false;
        }

        const equippedIsTwoHanded = this.flatGear[equippedWeapon].twoHanded;
        const hasOverrideShield = this.overrideAvatarGear && this.overrideAvatarGear.shield;

        return equippedIsTwoHanded && hasOverrideShield;
      } if (gearType === 'shield') {
        const overrideWeapon = this.overrideAvatarGear && this.overrideAvatarGear.weapon;
        const overrideIsTwoHanded = overrideWeapon && this.flatGear[overrideWeapon].twoHanded;

        return overrideIsTwoHanded;
      }

      return false;
    },
    castEnd (e) {
      if (!this.$store.state.spellOptions.castingSpell) return;
      this.$root.$emit('castEnd', this.member, 'user', e);
    },
    showAvatar () {
      if (!this.member) return false;
      if (!this.showVisualBuffs) return true;

      const { buffs } = this.member.stats;

      return !buffs.snowball && !buffs.spookySparkles && !buffs.shinySeed && !buffs.seafoam;
    },
  },
};
</script>
