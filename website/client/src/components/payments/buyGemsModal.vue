<template>
  <div v-if="user">
    <b-modal
      id="buy-gems"
      :hide-footer="true"
      size="md"
      :modal-class="eventInfo?.class"
    >
      <div
        slot="modal-header"
        class="header-wrap container"
      >
        <close-x
          @close="close()"
        />
        <div class="d-flex justify-content-center align-items-center">
          <img
            v-if="eventInfo?.gemsPromo"
            :alt="$t('supportHabitica')"
            :srcset="eventInfo.srcSet"
            :src="eventInfo.src"
          >
          <img
            v-else
            :alt="$t('supportHabitica')"
            src="/static/gems/header/normal-header.png"
            srcset="/static/gems/header/normal-header.png,
              /static/gems/header/normal-header@2x.png 2x,
              /static/gems/header/normal-header@3x.png 3x"
          >
        </div>
      </div>
      <div
        v-if="eventInfo?.promo === 'g1g1'"
        class="gift-promo-banner d-flex justify-content-around align-items-center px-4"
        @click="showSelectUser"
      >
        <div
          v-once
          class="svg-icon svg-gifts left-gift"
          v-html="icons.gifts"
        >
        </div>
        <div
          class="d-flex flex-column announce-text text-center"
        >
          <strong> {{ $t('g1g1') }} </strong>
          <small
            class="px-1 mt-1"
          >
            {{ $t('g1g1Details') }}
          </small>
        </div>
        <div
          v-once
          class="svg-icon svg-gifts right-gift"
          v-html="icons.gifts"
        >
        </div>
      </div>
      <div class="container">
        <div class="row text-center">
          <h2
            v-once
            class="col-12 text-leadin"
          >
            {{ $t('gemBenefitLeadin') }}
          </h2>
        </div>
        <div
          v-once
          class="gem-benefits ml-3 mb-4"
        >
          <div
            v-for="benefit in [1,3,2,4]"
            :key="benefit"
            class="d-flex"
          >
            <div class="d-flex bubble justify-content-center align-items-center">
              <div
                class="svg-icon check mx-auto"
                v-html="icons.check"
              ></div>
            </div>
            <p class="small-text">
              {{ $t(`gemBenefit${benefit}`) }}
            </p>
          </div>
        </div>
        <div class="row gem-deck">
          <div
            v-for="gemsBlock in gemsBlocks"
            :key="gemsBlock.key"
            class="text-center col-3"
            :class="{active: selectedGemsBlock === gemsBlock }"
          >
            <div
              class="mt-4 mb-3"
              v-html="icons[gemsBlock.key]"
            ></div>
            <div class="gem-count">
              {{ gemsBlock.gems }}
            </div>
            <div
              v-once
              class="gem-text"
            >
              {{ $t('gems') }}
            </div>
            <div
              v-if="gemsBlock.originalGems"
              class="small-text original-gems mb-2"
            >
              {{ $t('usuallyGems', {originalGems: gemsBlock.originalGems}) }}
            </div>
            <button
              v-if="!isSelected(gemsBlock)"
              class="btn btn-primary gem-btn"
              @click="selectGemsBlock(gemsBlock)"
            >
              {{ `$${gemsBlock.price / 100}` }}
            </button>
            <button
              v-else
              class="btn btn-success gem-btn"
              @click="selectGemsBlock(gemsBlock)"
            >
              <div
                v-once
                class="svg-icon check text-white mx-auto"
                v-html="icons.check"
              ></div>
            </button>
          </div>
        </div>
        <payments-buttons
          :disabled="!selectedGemsBlock"
          :stripe-fn="() => redirectToStripe({ gemsBlock: selectedGemsBlock })"
          :paypal-fn="() => openPaypal({
            url: paypalCheckoutLink, type: 'gems', gemsBlock: selectedGemsBlock
          })"
          :amazon-data="{type: 'single', gemsBlock: selectedGemsBlock}"
        />
        <div
          v-if="eventInfo?.gemsPromo"
          class="d-flex flex-column justify-content-center"
        >
          <h4 class="mt-3 mx-auto">
            {{ $t('howItWorks') }}
          </h4>
          <small class="text-center">
            {{ $t('gemSaleHow', {
              eventStartMonth: eventInfo.startMonth,
              eventStartOrdinal: eventInfo.startOrdinal,
              eventEndOrdinal: eventInfo.endOrdinal,
            }) }}
          </small>
          <h4 class="mt-3 mx-auto">
            {{ $t('limitations') }}
          </h4>
          <small class="text-center">
            {{ $t('gemSaleLimitationsText', {
              eventStartMonth: eventInfo.startMonth,
              eventStartOrdinal: eventInfo.startOrdinal,
              eventStartTime: eventInfo.startTime,
              eventEndMonth: eventInfo.endMonth,
              eventEndOrdinal: eventInfo.endOrdinal,
              eventEndTime: eventInfo.endTime,
              timeZone: eventInfo.timeZoneAbbrev,
            }) }}
          </small>
        </div>
      </div>
      <div class="gift-gems-prompt">
        <div class="gift-art">
          <div
            v-once
            class="sparkles"
            v-html="icons.sparkles"
          ></div>
          <div
            v-once
            class="gift"
            v-html="icons.giftPurple"
          ></div>
          <div
            v-once
            class="sparkles sparkles-right"
            v-html="icons.sparkles"
          ></div>
        </div>
        <a
          class="prompt-text"
          tabindex="0"
          @click="showSelectUserForGems"
          @keyup.enter="showSelectUserForGems"
        >
          {{ $t('giftGems') }}
        </a>
      </div>
    </b-modal>
  </div>
</template>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  #buy-gems {
    small {
      font-size: 12px;
      margin-left: 20px;
      margin-right: 20px;
    }

    .modal-dialog {
      max-width: 35.375rem;
    }

    .modal-body {
      padding: 0;
      background: $white;
      border-radius: 0px 0px 8px 8px;
    }

    .modal-close .svg-close {
      color: $white;
    }

    .modal-content {
      border: none;
      background: transparent;
    }

    .modal-header {
      padding: 0;
      border-bottom: 0px;
    }

    .wordmark svg {
      height: 40px;
      width: 181px;
    }
  }

  // Gem sale styles
  $promos: (
    'spring': $green-10,
    'summer': $red-50,
    'fall': $orange-10,
    'winter': $blue-10,
    'spooky': $orange-10,
    'flash': $green-10
  );

  @each $event, $color in $promos {
    #buy-gems.event-#{$event}_extra_gems {
      .header-wrap {
        padding-top: 4.5rem;
        padding-bottom: 1.5rem;
        background-image: url('/static/gems/header/fall-header-bg@2x.png');
        background-size: 100%;
      }

      .gem-btn {
        border: none;
        color: $black;

        &.btn-success {
          background: $green-50 !important;
        }
      }

      .gem-count {
        color: $color;
      }

      .close-icon {
        opacity: .5;

        &:hover {
          opacity: .75;
        }
      }
    }
  }

  #buy-gems.event-fall_extra_gems, #buy-gems.event-spooky_extra_gems {
    .gem-btn {
      background-image: linear-gradient(315deg, $red-100, $orange-50 50%, $yellow-50);
    }
  }
  #buy-gems.event-spring_extra_gems {
    .gem-btn {
      background-image: linear-gradient(91deg, $green-500 -9%, #CDFF8E 56%, $gold-color 117%);
    }
  }
  #buy-gems.event-summer_extra_gems {
    .gem-btn {
      color: $white;
      background-image: linear-gradient(91deg, #FF4F52 -6%, #FF56FF 103%);
    }
  }
  #buy-gems.event-spooky_extra_gems {
    .header-wrap {
      background-image: url('/static/gems/header/spooky-header-bg@2x.png');
    }
  }
  #buy-gems.event-winter_extra_gems {
    .gem-btn {
      background-image: linear-gradient(91deg, #CAB0FF -1%, #A0FFFA 105%);
    }
  }
  #buy-gems.event-flash_extra_gems {
    .gem-btn {
      background-image: linear-gradient(90deg, $red-100 -7%,
        $orange-100 26%, $yellow-100 53%, $blue-100 107%);
    }
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .gem-btn {
    min-width: 4.813rem;
    min-height: 2rem;
    margin-bottom: 0.5rem;
  }

  .bubble {
    width: 2rem;
    height: 2rem;
    border-radius: 1000px;
    border: 2px solid $gray-400;
  }

  .gem-benefits {
    & > div {
      gap: 12px;
    }
    display: grid;
    grid-template-columns: auto auto;
    gap: 16px 12px;
    p {
      font-style: normal;
      color: $gray-100;
      max-width: 205px;
      margin-bottom: 0px;
    }
  }

  .original-gems {
    font-style: normal;
    color: $gray-100;
  }

  .gem-deck {
    background: $gray-600;
    color: $gray-100;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }

  .gem-count {
    font-family: Roboto;
    font-size: 2rem;
    font-weight: bold;
    line-height: 1.25;
  }

  .gem-text {
    font-weight: bold;
    line-height: 1.71;
  }

  .gift-gems-prompt {
    margin-top: 2rem;
    padding: 1.5rem 1rem 1.25rem;
    background: $gray-10;
    border-radius: 0 0 8px 8px;
    text-align: center;

    .gift-art {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 0.5rem;

      ::v-deep svg {
        display: block;
        width: 100%;
        height: auto;
      }

      .sparkles {
        width: 2rem;
      }

      .gift {
        width: 1.5rem;
      }

      .sparkles-right {
        transform: scaleX(-1);
      }
    }

    .prompt-text {
      display: inline-block;
      margin-bottom: 0;
      font-family: Roboto;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px;
      color: $white;
      cursor: pointer;

      &:hover {
        color: $white;
        text-decoration: underline;
      }
    }
  }

  .gift-promo-banner {
    width: 100%;
    height: 5rem;
    background-image: linear-gradient(90deg, $teal-50 0%, $purple-400 100%);
    cursor: pointer;

    .announce-text {
      color: $white;
    }

    .left-gift {
      margin: auto 1rem auto auto;
    }

    .right-gift {
      margin: auto auto auto 1rem;
      filter: flipH;
      transform: scaleX(-1);
    }

    .svg-gifts {
      width: 4.6rem;
    }
  }

  .svg-icon.check {
    color: $purple-400;
    width: 16px;
    height: 16px;
  }

  .text-leadin {
    margin: 2rem auto 1.5rem auto;
    font-weight: bold;
    color: $purple-200;
  }

  .text-payment {
    line-height: 1.71;
    color: $gray-50;
  }
</style>

<script>
import find from 'lodash/find';
import moment from 'moment';
import { mapState } from '@/libs/store';
import markdown from '@/directives/markdown';
import paymentsMixin from '@/mixins/payments';

import checkIcon from '@/assets/svg/check.svg?raw';

import fourGems from '@/assets/svg/4-gems.svg?raw';
import twentyOneGems from '@/assets/svg/21-gems.svg?raw';
import fortyTwoGems from '@/assets/svg/42-gems.svg?raw';
import eightyFourGems from '@/assets/svg/84-gems.svg?raw';
import gifts from '@/assets/svg/gifts.svg?raw';
import giftPurple from '@/assets/svg/gift-purple-600.svg?raw';
import sparkles from '@/assets/svg/sparkles-left-purple-600-500.svg?raw';
import wordmark from '@/assets/svg/habitica-logo.svg?raw';

import closeX from '@/components/ui/closeX';
import paymentsButtons from '@/components/payments/buttons/list';
import { worldStateMixin } from '@/mixins/worldState';

export default {
  components: {
    closeX,
    paymentsButtons,
  },
  directives: {
    markdown,
  },
  mixins: [paymentsMixin, worldStateMixin],
  data () {
    return {
      icons: Object.freeze({
        check: checkIcon,
        '4gems': fourGems,
        '21gems': twentyOneGems,
        '42gems': fortyTwoGems,
        '84gems': eightyFourGems,
        gifts,
        giftPurple,
        sparkles,
        wordmark,
      }),
      selectedGemsBlock: null,
      alreadyTracked: false,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      originalGemsBlocks: 'content.gems',
      currentEventList: 'worldState.data.currentEventList',
    }),
    eventInfo () {
      const currentEvent = find(
        this.currentEventList, event => Boolean(event.gemsPromo) || Boolean(event.promo),
      );
      if (!currentEvent) return null;

      // https://stackoverflow.com/questions/1954397/detect-timezone-abbreviation-using-javascript#answer-66180857
      const timeZoneAbbrev = new Intl.DateTimeFormat('en-us', { timeZoneName: 'short' })
        .formatToParts(new Date())
        .find(part => part.type === 'timeZoneName')
        .value;

      const gemsPromoSeason = currentEvent.gemsPromo ? currentEvent.event.split('_')[0] // eslint-disable-line prefer-destructuring
        : '';

      return {
        name: currentEvent.event,
        class: currentEvent.gemsPromo ? `event-${currentEvent.event}` : '',
        gemsPromo: currentEvent.gemsPromo,
        src: `/static/gems/header/${gemsPromoSeason}-header.png`,
        srcSet: `/static/gems/header/${gemsPromoSeason}-header.png,
          /static/gems/header/${gemsPromoSeason}-header@2x.png 2x,
          /static/gems/header/${gemsPromoSeason}-header@3x.png 3x
        `,
        promo: currentEvent.promo,
        timeZoneAbbrev,
        startMonth: moment(currentEvent.start).format('MMMM'),
        startOrdinal: moment(currentEvent.start).format('Do'),
        startTime: moment(currentEvent.start).format('hh:mm A'),
        endMonth: moment(currentEvent.end).format('MMMM'),
        endOrdinal: moment(currentEvent.end).format('Do'),
        endTime: moment(currentEvent.end).format('hh:mm A'),
      };
    },
    isGemsPromoActive () {
      return Boolean(this.eventInfo?.gemsPromo);
    },
    gemsBlocks () {
      // We don't want to modify the original gems blocks when a promotion is running
      // Also the content data is frozen with Object.freeze and can't be changed
      // So we clone the blocks and adjust the number of gems if necessary
      const blocks = {};

      Object.keys(this.originalGemsBlocks).forEach(gemsBlockKey => {
        const originalBlock = this.originalGemsBlocks[gemsBlockKey];
        const newBlock = blocks[gemsBlockKey] = { ...originalBlock }; // eslint-disable-line no-multi-assign, max-len

        if (this.isGemsPromoActive) {
          newBlock.originalGems = originalBlock.gems;
          newBlock.gems = (
            this.eventInfo.gemsPromo[gemsBlockKey] || originalBlock.gems
          );
        }
      });

      return blocks;
    },
  },
  async mounted () {
    await this.triggerGetWorldState();

    this.$root.$on('bv::show::modal', modalId => {
      if (modalId === 'buy-gems') {
        // We force reloading the world state every time the modal is reopened
        // To make sure the promo status is always up to date
        this.triggerGetWorldState(true);
      }
    });
  },
  methods: {
    selectGemsBlock (gemsBlock) {
      if (gemsBlock === this.selectedGemsBlock) {
        this.selectedGemsBlock = null;
      } else {
        this.selectedGemsBlock = gemsBlock;
      }
    },
    isSelected (gemsBlock) {
      return this.selectedGemsBlock === gemsBlock;
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'buy-gems');
    },
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
      this.close();
    },
    showSelectUserForGems () {
      // Open the Send Gift flow on the Gems tab (instead of the default Subscription tab)
      this.$store.state.giftModalOptions.startingPage = 'buyGems';
      this.showSelectUser();
    },
  },
};
</script>
