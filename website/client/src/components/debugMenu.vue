<template>
  <div
    v-if="isUserLoaded"
    class="debug-toggle"
  >
    <button
      class="debug btn-primary"
      @click="debugMenuShown = !debugMenuShown"
    >
      Toggle Debug Menu
    </button>
    <div
      v-if="debugMenuShown"
      class="btn debug-toggle debug-group"
    >
      <div class="debug-pop">
        <a
          class="btn btn-secondary"
          @click="setHealthLow()"
        >Reduce Health to 1</a>
        <a
          class="btn btn-secondary"
          @click="addMissedDay(1)"
        >+1 Missed Day</a>
        <a
          class="btn btn-secondary"
          @click="addMissedDay(2)"
        >+2 Missed Days</a>
        <a
          class="btn btn-secondary"
          @click="addMissedDay(8)"
        >+8 Missed Days</a>
        <a
          class="btn btn-secondary"
          @click="addMissedDay(32)"
        >+32 Missed Days</a>
        <a
          class="btn btn-secondary"
          @click="addTenGems()"
        >+10 Gems</a>
        <a
          class="btn btn-secondary"
          @click="addHourglass()"
        >+1 Mystic Hourglass</a>
        <a
          class="btn btn-secondary"
          @click="addGold()"
        >+500GP</a>
        <a
          class="btn btn-secondary"
          @click="plusTenHealth()"
        >+ 10HP</a>
        <a
          class="btn btn-secondary"
          @click="addMana()"
        >+MP</a>
        <a
          class="btn btn-secondary"
          @click="addLevelsAndGold()"
        >+Exp +GP +MP</a>
        <a
          class="btn btn-secondary"
          @click="addExp()"
        >+Exp</a>
        <a
          class="btn btn-secondary"
          @click="addOneLevel()"
        >+1 Level</a>
        <a
          class="btn btn-secondary"
          tooltip="+1000 to boss quests. 300 items to collection quests"
          @click="addQuestProgress()"
        >Quest Progress Up</a>
        <a
          class="btn btn-secondary"
          @click="bossRage()"
        >+ Boss Rage 😡</a>
        <a
          class="btn btn-secondary"
          @click="giveUserSupport()"
        >Give User support permission</a>
        <div class="d-flex align-items-center mt-2">
          <input
            v-model.number="partyChatCount"
            type="number"
            min="1"
            class="form-control form-control-sm mr-2"
            style="width: 80px;"
          >
          <a
            class="btn btn-secondary"
            @click="seedPartyChat()"
          >Send Party Chat Messages</a>
        </div>
        <div class="d-flex align-items-center mt-2">
          <input
            v-model.number="inboxCount"
            type="number"
            min="1"
            class="form-control form-control-sm mr-2"
            style="width: 80px;"
          >
          <a
            class="btn btn-secondary"
            @click="seedInbox()"
          >Send Inbox Messages</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

button {
  border: none;
  border-radius: 4px;
  text-align: center;
  line-height: 1.71;
  font-weight: 700;
  font-size: .875rem;
  margin-bottom: 1rem;
  padding: .5rem 1rem;
  box-shadow: 0 1px 3px 0 rgb(26 24 29 / 12%), 0 1px 2px 0 rgb(26 24 29 / 24%);
}

.debug-toggle { grid-area: debug-toggle; }

.debug {
  border: 2px solid transparent;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 2px 12px;

  &:hover {
    box-shadow: 0 3px 6px 0 rgba($black, 0.12), 0 3px 6px 0 rgba($black, 0.24);
  }
  &:focus  {
    border: 2px solid $purple-400 !important;
    box-shadow: 0 3px 6px 0 rgba($black, 0.12), 0 3px 6px 0 rgba($black, 0.24);
  }
  :active {
    border: 2px solid $purple-600 !important;
    box-shadow: none;
  }
}

.debug-group {
  background-color: $gray-600;
  border: 2px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  font-weight: 700;
  padding: 8px 16px;

  .btn {
    margin: 2px;
  }

  a:hover {
    border: 2px solid transparent;
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    text-decoration: none !important;
  }
}

.btn-secondary {
  padding: 2px 12px;
}

@media (max-width: 767.99px) {
  .debug-toggle, .debug {
    width: 100%;
  }
}
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      debugMenuShown: false,
      partyChatCount: 450,
      inboxCount: 450,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    ...mapState(['isUserLoaded']),
  },
  methods: {
    plusTenHealth () {
      this.$store.dispatch('user:set', {
        'stats.hp': this.user.stats.hp += 10,
      });
    },
    setHealthLow () {
      this.$store.dispatch('user:set', {
        'stats.hp': 1,
      });
    },
    async addMissedDay (numberOfDays) {
      if (!window.confirm(`Are you sure you want to reset the day by ${numberOfDays} day(s)?`)) return; // eslint-disable-line no-alert
      const date = moment(this.user.lastCron).subtract(numberOfDays, 'days').toDate();
      await axios.post('/api/v4/debug/set-cron', {
        lastCron: date,
      });
      // @TODO: Notification.text('-' + numberOfDays + ' day(s), remember to refresh');
      // @TODO: Sync user?
    },
    async addTenGems () {
      await axios.post('/api/v4/debug/add-ten-gems');
      // @TODO: Notification.text('+10 Gems!');
      this.user.balance += 2.5;
    },
    async addHourglass () {
      await axios.post('/api/v4/debug/add-hourglass');
      // @TODO: Sync?
    },
    addGold () {
      this.$store.dispatch('user:set', {
        'stats.gp': this.user.stats.gp + 500,
      });
    },
    addMana () {
      this.$store.dispatch('user:set', {
        'stats.mp': this.user.stats.mp + 500,
      });
    },
    addLevelsAndGold () {
      this.$store.dispatch('user:set', {
        'stats.exp': this.user.stats.exp + 10000,
        'stats.gp': this.user.stats.gp + 10000,
        'stats.mp': this.user.stats.mp + 10000,
      });
    },
    addExp () {
      // @TODO: Name these variables better
      let exp = 0;
      const five = 10 * this.user.stats.lvl;
      const four = (this.user.stats.lvl ** 2) * 0.25;
      const three = four + five + 139.75;
      const two = three / 10;
      const one = Math.round(two) * 10;
      exp = this.user.stats.exp + one;
      this.$store.dispatch('user:set', {
        'stats.exp': exp,
      });
    },
    addOneLevel () {
      this.$store.dispatch('user:set', {
        'stats.lvl': this.user.stats.lvl + 1,
      });
    },
    async addQuestProgress () {
      await axios.post('/api/v4/debug/quest-progress');
      //  @TODO:  Notification.text('Quest progress increased');
      //  @TODO:  User.sync();
    },
    async bossRage () {
      await axios.post('/api/v4/debug/boss-rage');
    },
    async giveUserSupport () {
      await axios.post('/api/v4/debug/give-user-support');
    },
    async seedPartyChat () {
      try {
        const count = this.partyChatCount;
        if (!Number.isInteger(count) || count < 1) {
          window.alert('Please enter a positive integer'); // eslint-disable-line no-alert
          return;
        }
        await axios.post('/api/v4/debug/seed-party-chat', { messageCount: count });
        window.alert(`Successfully sent ${count} messages to your party chat!`); // eslint-disable-line no-alert
      } catch (e) {
        window.alert(e.response?.data?.message || 'Error sending party chat messages'); // eslint-disable-line no-alert
      }
    },
    async seedInbox () {
      try {
        const count = this.inboxCount;
        if (!Number.isInteger(count) || count < 1) {
          window.alert('Please enter a positive integer'); // eslint-disable-line no-alert
          return;
        }
        await axios.post('/api/v4/debug/seed-inbox', { messageCount: count });
        window.alert(`Successfully sent ${count} messages to your inbox!`); // eslint-disable-line no-alert
      } catch (e) {
        window.alert(e.response?.data?.message || 'Error sending inbox messages'); // eslint-disable-line no-alert
      }
    },
  },
};
</script>
