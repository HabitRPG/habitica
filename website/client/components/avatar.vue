<template lang="pug">

head

  script(src='https://unpkg.com/popper.js')
  script(src='https://unpkg.com/vue/dist/vue.js')
  script(src='https://unpkg.com/v-tooltip')

.avatar(:style="{width, height, paddingTop}", :class="backgroundClass", @click.prevent='castEnd()')
  .character-sprites(:style='{margin: spritesMargin}')
    template(v-if="!avatarOnly")
      // Mount Body
      span(v-if="member.items.currentMount", :class="'Mount_Body_' + member.items.currentMount")

    // Buffs that cause visual changes to avatar: Snowman, Ghost, Flower, etc
    template(v-for="(klass, item) in visualBuffs")
      span(v-if="member.stats.buffs[item]", :class="klass")

    // Show flower ALL THE TIME!!!
    // See https://github.com/HabitRPG/habitica/issues/7133
    span(:class="'hair_flower_' + member.preferences.hair.flower")

    // Show avatar only if not currently affected by visual buff
    template(v-if!="!member.stats.buffs.snowball && !member.stats.buffs.spookySparkles && !member.stats.buffs.shinySeed && !member.stats.buffs.seafoam")
      span(:class="'chair_' + member.preferences.chair")
      span(v-tooltip="showqeuipments", :class="getGearClass('back')")
      span(:class="skinClass")
      span(:class="member.preferences.size + '_shirt_' + member.preferences.shirt")
      span.head_0
      span(:class="member.preferences.size + '_' + getGearClass('armor')")
      span.head_0
      span(v-tooltip="showqeuipments",:class="getGearClass('back_collar')")
      span(v-tooltip="showqeuipments",:class="getGearClass('body')")
      template(v-for="type in ['base', 'bangs', 'mustache', 'beard']")
        span(:class="'hair_' + type + '_' + member.preferences.hair[type] + '_' + member.preferences.hair.color")
      span(v-tooltip="showqeuipments",:class="getGearClass('eyewear')")
      span(v-tooltip="showqeuipments",:class="getGearClass('head')")
      span(v-tooltip="showqeuipments",:class="getGearClass('headAccessory')")
      span(:class="'hair_flower_' + member.preferences.hair.flower")
      span(v-tooltip="showqeuipments",:class="getGearClass('shield')")
      span(v-tooltip="showqeuipments",:class="getGearClass('weapon')")
      
   //Equipment includes: eyewear, headgear, headaccessory, backaccessory, armor, body accessory, main hand, off hand

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

  .tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}

</style>

<script>

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
  },
  computed: {
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
    castEnd (e) {
      if (!this.$store.state.spellOptions.castingSpell) return;
      this.$root.$emit('castEnd', this.member, 'user', e);
    },
    
  },
};

  new Vue({
    el: '#app',
    data: {
      showqeuipments: this.user.items.gear.equipped[gearType];
    }
  })

</script>
