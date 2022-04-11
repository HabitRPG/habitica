<template>
  <div class="notification-animation-holder">
    <div
      class="notification-holder"
      @click="handleOnClick()"
    >
      <div
        v-if="notification.type === 'drop'"
        class="icon-item"
      >
        <div
          :class="notification.icon"
          class="icon-negative-margin"
        ></div>
      </div>

      <div
        class="notification callout pt-0"
        :class="classes"
      >
        <div
          v-if="notification.type === 'error'"
          class="row"
        >
          <div class="text">
            <div v-html="notification.text"></div>
          </div>
          <close-icon />
        </div>
        <div
          v-if="notification.type === 'streak'"
          class="row"
        >
          <div class="text">
            <div>{{ message }}</div>
          </div>
          <div class="icon d-flex align-items-center">
            <div
              class="svg-icon"
              v-html="icons.gold"
            ></div>
            <div
              class="icon-text"
              v-html="notification.text"
            ></div>
          </div>
        </div>
        <div
          v-if="['hp', 'gp', 'xp', 'mp'].indexOf(notification.type) !== -1"
          class="row"
        >
          <div class="text">
            <div>{{ message }}</div>
          </div>
          <div class="icon d-flex align-items-center">
            <div
              v-if="notification.type === 'hp'"
              class="svg-icon"
              v-html="icons.health"
            ></div>
            <div
              v-if="notification.type === 'gp'"
              class="svg-icon"
              v-html="icons.gold"
            ></div>
            <div
              v-if="notification.type === 'xp'"
              class="svg-icon"
              v-html="icons.star"
            ></div>
            <div
              v-if="notification.type === 'mp'"
              class="svg-icon"
              v-html="icons.mana"
            ></div>
            <div
              class="icon-text"
              v-html="notification.text"
            ></div>
          </div>
        </div>
        <div
          v-if="notification.type === 'damage'"
          class="row"
        >
          <div class="text">
            <div>{{ message }}</div>
          </div>
          <div class="icon d-flex align-items-center">
            <div
              class="svg-icon"
              v-html="icons.sword"
            ></div>
            <div
              class="icon-text"
              v-html="notification.text"
            ></div>
          </div>
        </div>
        <div
          v-if="['info', 'success', 'crit', 'lvl'].indexOf(notification.type) !== -1"
          class="row"
        >
          <div class="text">
            <div v-html="notification.text"></div>
          </div>
        </div>
        <div
          v-if="notification.type === 'drop'"
          class="row"
        >
          <div class="text">
            <div v-html="notification.text"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

  .notification-holder {
    display: flex;
    flex-direction: row;

    margin-bottom: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    width: 330px;
  }

  .notification {
    max-width: 330px;
    border-radius: 4px;
    background-color: $green-50;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    color: white;
    margin-left: 0.5rem;
    padding-left: 1rem !important;
    padding-right: 1rem !important;

    transition: opacity .5s, top .5s;

    .row {
      margin: 0 !important;
    }
  }

  .info {
    background-color: $blue-50;
    padding-top: .5rem;
  }

  .error {
    background-color: $maroon-100;
    color: $white;
    position: relative;
    padding-right: 1.5rem !important;
    cursor: pointer;

    ::v-deep button {
      height: 9px;
      width: 9px;
      top: 0.525rem;
      right: 0.525rem;
      padding: 0;

      opacity: 0.5;

      svg path {
        stroke: white;
      }
    }

    &:hover {
      ::v-deep button {
        opacity: 1;
      }
    }
  }

  .negative {
    background-color: $maroon-100;
  }

  .text {
    padding: .5rem 0;

    ::v-deep p:last-of-type {
      margin-bottom: 0; // remove last markdown padding
    }
  }

  .svg-icon {
    width: 24px;
    height: 24px;
    margin: 0.35rem;
  }

  .drop {
    background-color: $gray-50;
  }

  .icon-item {
    border-radius: 4px;
    box-shadow: 0 3px 6px 0 rgba(26, 24, 29, 0.16), 0 3px 6px 0 rgba(26, 24, 29, 0.24);
    background-color: $white;
  }

  .icon-text {
    color: $white;
    font-weight: bold;
  }

  .icon-negative-margin {
    margin: -0.5rem;
  }

  .notification-animation-holder {
    justify-content: flex-end;
    display: flex;
  }
</style>

<script>
import health from '@/assets/svg/health.svg';
import gold from '@/assets/svg/gold.svg';
import star from '@/assets/svg/star.svg';
import mana from '@/assets/svg/mana.svg';
import sword from '@/assets/svg/sword.svg';
import CloseIcon from '../shared/closeIcon';

export default {
  components: { CloseIcon },
  props: ['notification', 'visibleAmount'],
  data () {
    return {
      icons: Object.freeze({
        health,
        gold,
        star,
        mana,
        sword,
      }),
    };
  },
  computed: {
    message () {
      if (this.notification.flavorMessage) {
        return this.notification.flavorMessage;
      }
      let localeKey = this.negative === 'negative' ? 'lost' : 'gained';
      if (this.notification.type === 'hp') localeKey += 'Health';
      if (this.notification.type === 'mp') localeKey += 'Mana';
      if (this.notification.type === 'xp') localeKey += 'Experience';
      if (this.notification.type === 'gp') localeKey += 'Gold';
      if (this.notification.type === 'streak') localeKey = 'streakCoins';
      if (this.notification.type === 'damage') localeKey = 'bossDamage';
      return this.$t(localeKey);
      // This requires eight translatable strings, but that gives the
      // translators the most flexibility for matching gender/number
      // and for using idioms for lost/spent/used/gained.
    },
    negative () {
      return this.notification.sign === '-' ? 'negative' : 'positive';
    },
    classes () {
      return `${this.notification.type} ${this.negative}`;
    },
  },
  methods: {
    handleOnClick () {
      if (typeof this.notification.onClick === 'function') {
        this.notification.onClick();
      }
      this.$emit('clicked');
      this.show = false;
    },
  },
};
</script>
