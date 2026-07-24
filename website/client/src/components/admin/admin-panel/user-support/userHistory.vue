<template>
  <div class="card mt-2">
    <div class="card-header">
      <h3
        class="mb-0 mt-0"
        :class="{'open': expand}"
        @click="toggleHistoryOpen"
      >
        User History
      </h3>
    </div>
    <div
      v-if="expand"
      class="card-body"
    >
      <div>
        <div class="clearfix">
          <div class="mb-4 float-left">
            <button
              class="page-header btn-flat tab-button textCondensed"
              :class="{'active': selectedTab === 'armoire'}"
              @click="selectTab('armoire')"
            >
              Armoire
            </button>
            <button
              class="page-header btn-flat tab-button textCondensed"
              :class="{'active': selectedTab === 'questInvites'}"
              @click="selectTab('questInvites')"
            >
              Quest Invitations
            </button>
            <button
              class="page-header btn-flat tab-button textCondensed"
              :class="{'active': selectedTab === 'cron'}"
              @click="selectTab('cron')"
            >
              Cron
            </button>
          </div>
        </div>

        <div class="row">
          <div
            v-if="selectedTab === 'armoire'"
            class="col-12"
          >
            <table class="table">
              <tr>
                <th
                  v-once
                >
                  {{ $t('timestamp') }}
                </th>
                <th v-once>
                  Client
                </th>
                <th
                  v-once
                >
                  Received
                </th>
              </tr>
              <tr
                v-for="entry in armoire"
                :key="entry.timestamp"
              >
                <td>
                  <span
                    v-b-tooltip.hover="entry.timestamp"
                  >{{ entry.timestamp | timeAgo }}</span>
                </td>
                <td>{{ entry.client }}</td>
                <td>{{ entry.reward }}</td>
              </tr>
            </table>
          </div>
          <div
            v-if="selectedTab === 'questInvites'"
            class="col-12"
          >
            <table class="table">
              <tr>
                <th
                  v-once
                >
                  {{ $t('timestamp') }}
                </th>
                <th v-once>
                  Client
                </th>
                <th v-once>
                  Quest Key
                </th>
                <th v-once>
                  Response
                </th>
              </tr>
              <tr
                v-for="entry in questInviteResponses"
                :key="entry.timestamp"
              >
                <td>
                  <span
                    v-b-tooltip.hover="entry.timestamp"
                  >{{ entry.timestamp | timeAgo }}</span>
                </td>
                <td>{{ entry.client }}</td>
                <td>{{ entry.quest }}</td>
                <td>{{ questInviteResponseText(entry.response) }}</td>
              </tr>
            </table>
          </div>
          <div
            v-if="selectedTab === 'cron'"
            class="col-12"
          >
            <table class="table">
              <tr>
                <th
                  v-once
                >
                  {{ $t('timestamp') }}
                </th>
                <th v-once>
                  Client
                </th>
                <th v-once>
                  Checkin Count
                </th>
              </tr>
              <tr
                v-for="entry in cron"
                :key="entry.timestamp"
              >
                <td>
                  <span
                    v-b-tooltip.hover="entry.timestamp"
                  >{{ entry.timestamp | timeAgo }}</span>
                </td>
                <td>{{ entry.client }}</td>
                <td>{{ entry.checkinCount }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

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
</style>

<script>
import moment from 'moment';
import { userStateMixin } from '../../../../mixins/userState';

export default {
  filters: {
    timeAgo (value) {
      return moment(value).fromNow();
    },
  },
  mixins: [userStateMixin],
  props: {
    hero: {
      type: Object,
      required: true,
    },
    resetCounter: {
      type: Number,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
      selectedTab: 'armoire',
      armoire: [],
      questInviteResponses: [],
      cron: [],
    };
  },
  watch: {
    resetCounter () {
      if (this.expand) {
        this.retrieveUserHistory();
      }
    },
  },
  methods: {
    selectTab (type) {
      this.selectedTab = type;
    },
    async toggleHistoryOpen () {
      this.expand = !this.expand;
      if (this.expand) {
        this.retrieveUserHistory();
      }
    },
    async retrieveUserHistory () {
      const history = await this.$store.dispatch('admin:getUserHistory', { userIdentifier: this.hero._id });
      this.armoire = history.armoire;
      this.questInviteResponses = history.questInviteResponses;
      this.cron = history.cron;
    },
    questInviteResponseText (response) {
      if (response === 'accept') {
        return 'Accepted';
      }
      if (response === 'reject') {
        return 'Rejected';
      }
      if (response === 'leave') {
        return 'Left active quest';
      }
      if (response === 'invite') {
        return 'Accepted as owner';
      }
      if (response === 'abort') {
        return 'Aborted by owner';
      }
      if (response === 'abortByLeader') {
        return 'Aborted by party leader';
      }
      if (response === 'cancel') {
        return 'Cancelled before start';
      }
      if (response === 'cancelByLeader') {
        return 'Cancelled before start by party leader';
      }
      return response;
    },
  },
};
</script>
