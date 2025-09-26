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
        <Sprite
          :image-name="notification.icon"
          class="icon-negative-margin"
        />
      </div>

      <div
        class="notification callout py-2 ml-2"
        :class="classes"
      >
        <div
          v-if="notification.type === 'error'"
          class="row pr-4"
        >
          <div class="text">
            <div v-html="notification.text"></div>
          </div>
          <close-x />
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
          <div class="icon d-flex align-items-center ml-3">
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
              class="icon-text ml-1"
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
          <div class="icon d-flex align-items-center ml-3">
            <div
              class="svg-icon"
              v-html="icons.sword"
            ></div>
            <div
              class="icon-text ml-1"
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
@import '@/assets/scss/colors.scss';

  ::v-deep .modal-close {
    top: 11px;
    right: 11px;

    .svg-close {
      color: $black;
    }
  }

  .notification-holder {
    display: flex;
    flex-direction: row;

    margin-bottom: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    width: 330px;
  }

  .notification {
    color: $black;
    max-width: 330px;
    border-radius: 4px;
    padding-left: 12px;
    padding-right: 12px;
    background-color: $green-100;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    line-height: 1.714;

    transition: opacity .5s, top .5s;

    .row {
      margin: 0 !important;
    }
  }

  .info {
    background-color: $blue-100;
    padding-top: .5rem;
  }

  .error {
    background-color: $red-100;
    position: relative;
    cursor: pointer;
  }

  .negative {
    background-color: $red-100;
  }

  .text {
    ::v-deep p:last-of-type {
      margin-bottom: 0; // remove last markdown padding
    }
  }

  .svg-icon {
    width: 24px;
    height: 24px;
  }

  .drop {
    color: $white;
    background-color: $gray-50;
  }

  .icon-item {
    border-radius: 4px;
    box-shadow: 0 3px 6px 0 rgba(26, 24, 29, 0.16), 0 3px 6px 0 rgba(26, 24, 29, 0.24);
    background-color: $white;
  }

  .icon-text {
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
import health from '@/assets/svg/health.svg?raw';
import gold from '@/assets/svg/gold.svg?raw';
import star from '@/assets/svg/star.svg?raw';
import mana from '@/assets/svg/mana.svg?raw';
import sword from '@/assets/svg/sword.svg?raw';
import CloseX from '@/components/ui/closeX';
import Sprite from '@/components/ui/sprite';

export default {
  components: {
    CloseX,
    Sprite,
  },
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
  mounted () {
    if (this.notification.type === 'drop' && this.notification.emptied) {
      this.$root.$emit('bv::show::modal', 'armoire-empty');
    }
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
