<template>
  <div>
    <div
      :id="itemId"
      class="item-wrapper"
      tabindex="0"
      @click="click()"
      @keypress.enter="click()"
      @blur="blur"
    >
      <div
        class="item"
        :class="getItemClasses()"
      >
        <slot
          name="itemBadge"
          :item="item"
          :emptyItem="emptyItem"
        ></slot>
        <span
          v-if="item.event && item.owned == null && showEventBadge"
          class="badge badge-round badge-item badge-clock"
        >
          <span
            class="svg-icon inline clock"
            v-html="icons.clock"
          ></span>
        </span>
        <span
          v-if="item.locked"
          class="svg-icon inline lock"
          v-html="icons.lock"
        ></span>
        <span
          v-if="item.completed"
          class="svg-icon inline check"
          v-html="icons.check"
        ></span>
        <span
          v-if="item.isSuggested"
          class="suggestedDot"
        ></span>
        <div class="image">
          <div
            v-once
            :class="item.class"
          ></div>
          <slot
            name="itemImage"
            :item="item"
          ></slot>
        </div>
        <div
          class="price d-flex align-items-center justify-content-center"
          :class="currencyClass"
        >
          <span
            v-once
            :class="{ 'w-0': currencyClass === 'unlock'}"
            class="svg-icon inline icon-16 mr-1"
            v-html="icons[currencyClass]"
          ></span>
          <span
            v-once
            class="price-label"
            :class="currencyClass"
          >{{ getPrice() }}</span>
        </div>
      </div>
    </div>
    <b-popover
      v-if="showPopover"
      ref="popover"
      :target="itemId"
      triggers="hover focus"
      :placement="popoverPosition"
    >
      <slot
        name="popoverContent"
        :item="item"
      >
        <equipmentAttributesPopover
          v-if="item.purchaseType === 'gear'"
          :item="item"
        />
        <div
          v-else-if="item.purchaseType === 'quests'"
          class="questPopover"
        >
          <h4 class="popover-content-title">
            {{ item.text }}
          </h4>
          <questInfo :quest="item" />
        </div>
        <div v-else>
          <h4
            v-once
            class="popover-content-title"
          >
            {{ item.text }}
          </h4>
          <div
            v-if="showNotes && item.key !== 'armoire'"
            v-once
            class="popover-content-text"
          >
            {{ item.notes }}
          </div>
          <div
            v-if="showNotes && item.key === 'armoire'"
            class="popover-content-text"
          >
            {{ item.notes }}
          </div>
        </div>
        <div
          v-if="item.event && item.purchaseType !== 'quests'"
          :class="item.purchaseType === 'gear' ? 'mt-4' : 'mt-2'"
        >
          {{ limitedString }}
        </div>
      </slot>
    </b-popover>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .item-wrapper {
    z-index: 10;
  }

  .item {
    height: 7.5rem;
    width: 94px;
    border-radius: 4px;
    background-color: $white;
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    cursor: pointer;

    &.locked .price {
      opacity: 0.5;
    }
  }

  .image {
    margin: 12px 13px;
  }

  .price {
    height: 1.75rem;
    width: 94px;
    margin-left: -1px;
    margin-right: -1px;
    border-radius: 0px 0px 4px 4px;

    &.gems {
      background-color: rgba($green-100, 0.15);
    }

    &.gold {
      background-color: rgba($yellow-100, 0.15);
    }

    &.hourglasses {
      background-color: rgba($blue-50, 0.15);
    }

    &.unlock {
      background-color: rgba($gray-400, 0.15);
    }
  }

  .price-label {
    font-family: Roboto;
    font-size: 12px;
    font-weight: bold;
    line-height: 1.33;

    &.gems {
      color: $green-1;
    }

    &.gold {
      color: $yellow-1;
    }

    &.unlock {
      color: $gray-100;
    }

    &.hourglasses {
      color: $blue-1;
    }
  }

  span.svg-icon.inline.lock {
    height: 12px;
    width: 10px;
    position: absolute;
    right: 8px;
    top: 8px;
    margin-top: 0;
    color: $gray-200;
  }

  span.svg-icon.inline.check {
    height: 16px;
    width: 16px;
    position: absolute;
    left: 4px;
    top: 4px;
    color: $gray-200;
  }

  span.badge.badge-round.badge-item.badge-clock {
    height: 24px;
    width: 24px;
    background-color: $purple-300;
    position: absolute;
    left: -8px;
    top: -12px;
    margin-top: 0;
    padding: 4px;
  }

  span.svg-icon.inline.clock {
    height: 16px;
    width: 16px;
  }

  .suggestedDot {
    width: 6px;
    height: 6px;
    background-color: $purple-400;
    border-radius: 4px;

    position: absolute;
    right: 8px;
    top: 8px;
    margin-top: 0;
  }

  .icon-48 {
    width: 48px;
    height: 48px;
  }

  .w-0 {
    width: 0rem;
  }
</style>

<script>
import { v4 as uuid } from 'uuid';

import moment from 'moment';
import svgGem from '@/assets/svg/gem.svg';
import svgGold from '@/assets/svg/gold.svg';
import svgHourglasses from '@/assets/svg/hourglass.svg';
import svgLock from '@/assets/svg/lock.svg';
import svgCheck from '@/assets/svg/check.svg';
import svgClock from '@/assets/svg/clock.svg';

import EquipmentAttributesPopover from '@/components/inventory/equipment/attributesPopover';

import QuestInfo from './quests/questInfo.vue';

export default {
  components: {
    EquipmentAttributesPopover,
    QuestInfo,
  },
  props: {
    item: {
      type: Object,
    },
    price: {
      type: Number,
      default: -1,
    },
    emptyItem: {
      type: Boolean,
      default: false,
    },
    highlightBorder: {
      type: Boolean,
      default: false,
    },
    popoverPosition: {
      type: String,
      default: 'bottom',
    },
    showPopover: {
      type: Boolean,
      default: true,
    },
    showEventBadge: {
      type: Boolean,
      default: true,
    },
    owned: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      itemId: uuid(),
      icons: Object.freeze({
        gems: svgGem,
        gold: svgGold,
        lock: svgLock,
        check: svgCheck,
        hourglasses: svgHourglasses,
        clock: svgClock,
      }),
      timer: '',
      limitedString: '',
    };
  },
  computed: {
    showNotes () {
      if (['armoire', 'potion'].indexOf(this.item.path) > -1) return true;
      return false;
    },
    currencyClass () {
      if (this.item.unlockCondition && this.item.unlockCondition.condition === 'party invite' && !this.owned) return 'unlock';
      if (this.item.currency && this.icons[this.item.currency]) {
        return this.item.currency;
      }
      return 'gold';
    },
  },
  mounted () {
    this.countdownString();
    this.timer = setInterval(this.countdownString, 1000);
    this.$root.$on('buyModal::hidden', itemKey => {
      if (this.$refs && this.$refs.popover && itemKey === this.item.key) {
        this.$refs.popover.$emit('close');
        this.$refs.popover.$emit('disable');
      }
    });
  },
  beforeDestroy () {
    this.cancelAutoUpdate();
  },
  methods: {
    click () {
      this.$emit('click', {});
    },
    blur () {
      this.$refs.popover.$emit('enable');
    },
    getPrice () {
      if (this.item.unlockCondition && this.item.unlockCondition.condition === 'party invite' && !this.owned) return this.item.unlockCondition.text();
      if (this.price === -1) {
        return this.item.value;
      }
      return this.price;
    },
    getItemClasses () {
      return {
        'item-empty': this.emptyItem,
        'highlight-border': this.highlightBorder,
        suggested: this.item.isSuggested,
        locked: this.item.locked,
        completed: this.item.completed,
      };
    },
    countdownString () {
      if (!this.item.event) return;
      const diffDuration = moment.duration(moment(this.item.event.end).diff(moment()));

      if (diffDuration.asSeconds() <= 0) {
        this.limitedString = this.$t('noLongerAvailable');
      } else if (diffDuration.days() > 0 || diffDuration.months() > 0) {
        this.limitedString = this.$t('limitedAvailabilityDays', {
          days: moment(this.item.event.end).diff(moment(), 'days'),
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else if (diffDuration.asMinutes() > 2) {
        this.limitedString = this.$t('limitedAvailabilityHours', {
          hours: diffDuration.hours(),
          minutes: diffDuration.minutes(),
        });
      } else {
        this.limitedString = this.$t('limitedAvailabilityMinutes', {
          minutes: diffDuration.minutes(),
          seconds: diffDuration.seconds(),
        });
      }
    },
    cancelAutoUpdate () {
      clearInterval(this.timer);
    },
  },
};
</script>
