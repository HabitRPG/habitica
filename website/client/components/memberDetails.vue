<template lang="pug">
.d-flex.member-details(:class="{ condensed, expanded }")
  avatar(:member="member", @click.native="$emit('click')",)
  .member-stats
    h3.character-name 
      | {{member.profile.name}}
      .is-buffed(v-if="isBuffed")
        .svg-icon(v-html="icons.buff")
    span.small-text.character-level {{ characterLevel }}
    .progress-container.d-flex
      .svg-icon(v-html="icons.health")
      .progress
        .progress-bar.bg-health(:style="{width: `${percent(member.stats.hp, MAX_HEALTH)}%`}")
      span.small-text {{member.stats.hp | round}} / {{MAX_HEALTH}}
    .progress-container.d-flex
      .svg-icon(v-html="icons.experience")
      .progress
        .progress-bar.bg-experience(:style="{width: `${percent(member.stats.exp, toNextLevel)}%`}")
      span.small-text {{member.stats.exp | round}} / {{toNextLevel}}
    .progress-container.d-flex(v-if="hasClass")
      .svg-icon(v-html="icons.mana")
      .progress
        .progress-bar.bg-mana(:style="{width: `${percent(member.stats.mp, maxMP)}%`}")
      span.small-text {{member.stats.mp | round}} / {{maxMP}}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.member-details {
  white-space: nowrap;
  margin-top: 24px;
  margin-bottom: 24px;
  transition: all .15s ease;
}

.member-stats {
  padding-left: 16px;
  padding-right: 24px;
  height: auto;
  opacity: 1;
  transition: all 0.15s ease-out;
}

.member-details.condensed:not(.expanded) .member-stats {
  opacity: 0;
  height: 0;
  padding: 0;
  width: 0;
}

// Condensed version
.member-details.condensed.expanded {
  background: $header-dark-background;
  padding-top: 9px;
  margin-top: 15px;
  border-radius: 4px;
  padding-left: 9px;
  box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);

  .is-buffed {
    background-color: $purple-50;
  }

  .member-stats {
    padding-right: 16px;
  }

  .progress-container > .svg-icon {
    width: 19px;
    height: 19px;
    margin-top: -2px;
  }

  .progress-container > .progress {
    width: 152px;
    border-radius: 0px;
    height: 10px;
    margin-top: 2px;
  }

  .progress-container > .progress > .progress-bar {
    border-radius: 0px;
    height: 10px;
  }
}

.small-text {
  color: $header-color;
}

.character-name {
  margin-bottom: 1px;
  color: $white;
}

.character-level {
  display: block;
  font-style: normal;
  margin-bottom: 16px;
}

.is-buffed {
  width: 20px;
  height: 20px;
  background: $header-dark-background;
  display: inline-block;
  margin-left: 16px;
  vertical-align: middle;

  .svg-icon {
    display: block;
    width: 10px;
    height: 12px;
    margin: 0 auto;
  }
}

#header-avatar {
  margin-right: 16px;
}

.progress-container {
  margin-bottom: 12px;
}

.progress-container > span {
  color: $header-color;
  margin-left: 16px;
  font-style: normal;
}

.progress-container > .svg-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  margin-top: -4px;
}

.progress-container > .progress {
  width: 303px;
  margin: 0px;
  border-radius: 2px;
  height: 16px;
  background-color: $header-dark-background;
}

.progress-container > .progress > .progress-bar {
  border-radius: 2px;
  height: 16px;
  min-width: 0px;
}
</style>

<script>
import Avatar from './avatar';
import { mapState } from 'client/libs/store';

import { toNextLevel } from '../../common/script/statHelpers';
import statsComputed from '../../common/script/libs/statsComputed';
import percent from '../../common/script/libs/percent';

import buffIcon from 'assets/svg/buff.svg';
import healthIcon from 'assets/svg/health.svg';
import experienceIcon from 'assets/svg/experience.svg';
import manaIcon from 'assets/svg/mana.svg';

export default {
  components: {
    Avatar,
  },
  props: {
    member: {
      type: Object,
      required: true,
    },
    condensed: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        buff: buffIcon,
        health: healthIcon,
        experience: experienceIcon,
        mana: manaIcon,
      }),
    };
  },
  methods: {
    percent,
    hasClass () {
      return this.$store.getters['members:hasClass'](this.member);
    },
    isBuffed () {
      return this.$store.getters['members:isBuffed'](this.member);
    },
  },
  computed: {
    ...mapState({
      MAX_HEALTH: 'constants.MAX_HEALTH',
    }),
    maxMP () {
      return statsComputed(this.member).maxMP;
    },
    toNextLevel () { // Exp to next level
      return toNextLevel(this.member.stats.lvl);
    },
    characterLevel () {
      return `${this.$t('level')} ${this.member.stats.lvl} ${
        this.member.stats.class ? this.$t(this.member.stats.class) : ''
      }`;
    },
  },
};
</script>
