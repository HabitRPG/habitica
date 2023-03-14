<template>
  <div>
    <div class="clearfix">
      <div class="mb-4 float-left">
        <button
          class="page-header btn-flat tab-button textCondensed"
          :class="{'active': selectedTab === 'gems'}"
          @click="selectTab('gems')"
        >
          {{ $t('gems') }}
        </button>
        <button
          class="page-header btn-flat tab-button textCondensed"
          :class="{'active': selectedTab === 'hourglass'}"
          @click="selectTab('hourglass')"
        >
          {{ $t('mysticHourglass', { amount: ''}) }}
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-12" v-if="selectedTab === 'gems'">
        <span v-if="gemTransactions.length === 0">
          {{ $t('noGemTransactions') }}
        </span>
        <table class="table">
          <tr>
            <th v-once class="timestamp-column">
              {{ $t('timestamp')}}
            </th>
            <th v-once class="amount-column">
              {{ $t('amount')}}
            </th>
            <th v-once class="action-column">
              {{ $t('action')}}
            </th>
            <th v-once class="note-column">
              {{ $t('note')}}
            </th>
          </tr>
          <tr
            v-for="entry in gemTransactions"
            :key="entry.createdAt"
          >
            <td>
              <span
                v-b-tooltip.hover="entry.createdAt"
              >{{ entry.createdAt | timeAgo }}</span>
            </td>
            <td>
              <div class="amount-with-icon" :id="entry.id">
                <span
                  class="svg-icon inline icon-16 my-1"
                  aria-hidden="true"
                  v-html="entry.amount < 0 ? icons.gemRed : icons.gem"
                ></span>
                <span
                  class="amount gems"
                  :class="entry.amount | addedDeducted"
                >{{ entry.amount * 4 }}</span>
              </div>

              <b-popover
                v-if="typeof entry.currentAmount !== 'undefined'"
                ref="popover"
                :target="entry.id"
                triggers="hover focus click"
                placement="bottom"
              >
                <div class="remaining-amount-popover-content">
                  {{ $t('remainingBalance') }}:
                  <span
                    class="svg-icon inline icon-16 ml-1"
                    aria-hidden="true"
                    v-html="icons.gem"
                  ></span>
                  <span
                    class="amount gems"
                  >{{ entry.currentAmount * 4 }}</span>
                </div>
              </b-popover>
            </td>
            <td class="entry-action">
              <span v-html="transactionTypeText(entry.transactionType)"></span>
            </td>
            <td>
              <span v-if="transactionTypes.gifted.includes(entry.transactionType)">
                <router-link
                  class="user-link"
                  :to="{'name': 'userProfile', 'params': {'userId': entry.reference}}"
                >
                  @{{ entry.referenceText }}
                </router-link>
              </span>
              <span v-else-if="transactionTypes.challenges.includes(entry.transactionType)">
                <router-link
                    class="challenge-link"
                    :to="{ name: 'challenge', params: { challengeId: entry.reference } }">
                  <span
                    v-markdown="entry.referenceText"
                  ></span>
                </router-link>
              </span>
              <span v-else v-html="entryReferenceText(entry)"></span>

              <span v-if="entry.reference">
                ({{entry.reference}})
              </span>
            </td>
          </tr>
        </table>
      </div>
      <div class="col-12" v-if="selectedTab === 'hourglass'">
        <span v-if="hourglassTransactions.length === 0">
          {{ $t('noHourglassTransactions') }}
        </span>
        <table class="table">
          <tr>
            <th v-once class="timestamp-column">
              {{ $t('timestamp')}}
            </th>
            <th v-once class="amount-column">
              {{ $t('amount')}}
            </th>
            <th v-once class="action-column">
              {{ $t('action')}}
            </th>
            <th v-once class="note-column">
              {{ $t('note')}}
            </th>
          </tr>
          <tr
            v-for="entry in hourglassTransactions"
            :key="entry.createdAt"
          >
            <td>
              <span
                v-b-tooltip.hover="entry.createdAt"
              >{{ entry.createdAt | timeAgo }}</span>
            </td>
            <td>
              <div class="amount-with-icon" :id="entry.id">
                <span
                  class="svg-icon inline icon-16 my-1"
                  aria-hidden="true"
                  v-html="entry.amount < 0 ? icons.hourglassRed : icons.hourglass"
                ></span>
                <span
                  class="amount hourglasses"
                  :class="entry.amount | addedDeducted"
                >{{ entry.amount }}</span>
              </div>

              <b-popover
                v-if="typeof entry.currentAmount !== 'undefined'"
                ref="popover"
                :target="entry.id"
                triggers="hover focus click"
                placement="bottom"
              >
                <div class="remaining-amount-popover-content">
                  {{ $t('remainingBalance') }}:
                  <span
                    class="svg-icon inline icon-16 ml-1"
                    aria-hidden="true"
                    v-html="icons.hourglass"
                  ></span>
                  <span
                    class="amount gems"
                  >{{ entry.currentAmount }}</span>
                </div>
              </b-popover>
            </td>
            <td class="entry-action">
              <span v-html="transactionTypeText(entry.transactionType)"></span>
            </td>
            <td>
              <span v-html="entryReferenceText(entry)"></span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .page-header.btn-flat {
    background: transparent;
  }

  .tab-button {
    height: 2rem;
    font-size: 24px;
    font-weight: bold;
    font-stretch: condensed;
    line-height: 1.33;
    letter-spacing: normal;
    color: $gray-10;

    margin-right: 1.125rem;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 2.5rem;

    &.active, &:hover {
      color: $purple-300;
      box-shadow: 0px -0.25rem 0px $purple-300 inset;
      outline: none;
    }
  }

  .amount-column {
    white-space: nowrap;
  }

  .svg-icon {
    vertical-align: middle;
  }

  .amount {
    font-weight: bold;
    margin-left: 4px;
  }

  .added::before {
    content: "+";
  }

  .gems {
    color: $green-10;

    &.deducted {
      color: $maroon-50;
    }
  }

  .hourglasses {
    font-weight: bold;
    color: $green-10;
    &.deducted {
      color: $maroon-50;
    }
  }

  .amount-with-icon {
    display: inline-flex;
  }

  .remaining-amount-popover-content {
    display: flex;
    font-size: 12px;
    line-height: 1.33;
    color: $white;
  }

  table {
    line-height: 1.71;
    color: $gray-50;
  }

  th {
    border-top: 0 !important;
    padding: 0.25rem 0.5rem !important;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-50;
  }

  td {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;

    line-height: 1.71;
    color: $gray-50;
  }

  th, td {
    padding-top: 0.35rem !important;
    padding-bottom: 0.35rem !important;
  }

  .timestamp-column, .action-column  {
    width: 20%;
  }

  .amount-column {
    width: 10%;
  }

  .note-column {
    width: 50%;
  }

  .entry-action {
    b {
      text-transform: uppercase;
    }
  }
</style>

<script>
import moment from 'moment';
import svgGem from '@/assets/svg/gem.svg';
import svgGemRed from '@/assets/svg/gem-red.svg';
import svgHourglass from '@/assets/svg/hourglass.svg';
import svgHourglassRed from '@/assets/svg/hourglass-red.svg';
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
    date (value) {
      // @TODO: Vue doesn't support this so we cant user preference
      return moment(value).toDate().toString();
    },
    addedDeducted (amount) {
      if (amount === 0) {
        return '';
      }

      return amount < 0 ? 'deducted' : 'added';
    },
  },
  props: {
    gemTransactions: {
      type: Array,
      required: true,
    },
    hourglassTransactions: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        gem: svgGem,
        gemRed: svgGemRed,
        hourglass: svgHourglass,
        hourglassRed: svgHourglassRed,
      }),
      selectedTab: 'gems',
      transactionTypes: Object.freeze({
        gifted: ['gift_send', 'gift_receive'],
        challenges: ['create_challenge', 'create_bank_challenge'],
      }),
    };
  },
  methods: {
    selectTab (type) {
      this.selectedTab = type;
    },
    entryReferenceText (entry) {
      if (entry.reference === undefined && entry.referenceText === undefined) {
        return '';
      }
      if (entry.referenceText) {
        return entry.referenceText;
      }
      return entry.reference;
    },
    transactionTypeText (transactionType) {
      return this.$t(`transaction_${transactionType}`);
    },
  },
};
</script>
