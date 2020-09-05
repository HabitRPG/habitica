<template>
  <div
    v-if="user.contributor.admin"
    class="row standard-page"
  >
    <div class="well">
      <h1>Admin Panel</h1>

      <div class="row">
        <form
          class="form-inline"
          @submit.prevent="loadHero(heroID)"
        >
          <input
            v-model="heroID"
            class="form-control"
            type="text"
            :placeholder="'User ID or Username; blank for your account'"
            :style="{ 'min-width': '45ch' }"
          >
          <input
            type="submit"
            value="Load User (click or hit enter)"
            class="btn btn-secondary"
          >
        </form>
      </div>

      <div
        v-if="hero && hero.profile"
        class="row"
      >
        <div class="form col-12">
          <basic-details
            :user-id="hero._id"
            :auth="hero.auth"
            :preferences="hero.preferences"
            :profile="hero.profile"
          />

          <privileges-and-gems
            :hero="hero"
            :reset-counter="resetCounter"
          />

          <cron-and-auth
            :auth="hero.auth"
            :preferences="hero.preferences"
            :last-cron="hero.lastCron"
            :reset-counter="resetCounter"
          />

          <party-and-quest
            :user-id="hero._id"
            :username="hero.auth.local.username"
            :user-has-party="hasParty"
            :party-not-exist-error="partyNotExistError"
            :user-party-data="hero.party"
            :group-party-data="party"
            :reset-counter="resetCounter"
          />

          <avatar-and-drops
            :items="hero.items"
            :preferences="hero.preferences"
          />

          <items-owned
            :hero="hero"
            :reset-counter="resetCounter"
          />

          <contributor-details
            :hero="hero"
            :reset-counter="resetCounter"
            @clear-data="clearData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .accordion-group .accordion-group {
    margin-left: 1em;
  }
  h3 {
    margin-top: 2em;
  }
  h4 {
    margin-top: 1em;
  }
  .expand-toggle::after {
    margin-left: 5px;
  }
  .subsection-start {
    margin-top: 1em;
  }
  .form-inline {
    margin-bottom: 1em;
    input, span {
      margin-left: 5px;
    }
  }
  .errorMessage {
    font-weight: bold;
  }
  .markdownPreview {
    margin-left: 3em;
    margin-top: 1em;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import BasicDetails from './user-support/basicDetails';
import ItemsOwned from './user-support/itemsOwned';
import CronAndAuth from './user-support/cronAndAuth';
import PartyAndQuest from './user-support/partyAndQuest';
import AvatarAndDrops from './user-support/avatarAndDrops';
import PrivilegesAndGems from './user-support/privilegesAndGems';
import ContributorDetails from './user-support/contributorDetails';

export default {
  components: {
    BasicDetails,
    ItemsOwned,
    CronAndAuth,
    PartyAndQuest,
    AvatarAndDrops,
    PrivilegesAndGems,
    ContributorDetails,
  },
  data () {
    return {
      resetCounter: 0,
      hero: {},
      heroID: '',
      party: {},
      hasParty: false,
      partyNotExistError: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    clearData: function clearData () {
      this.hero = {};
    },

    async loadHero (id) {
      let uuid = id || this.user._id;
      uuid = uuid.replace(/@/, ''); // allow "@name" to be entered
      const hero = await this.$store.dispatch('hall:getHero', { uuid });
      this.hero = { ...hero };

      if (!this.hero.flags) {
        this.hero.flags = {
          chatRevoked: false,
          chatShadowMuted: false,
        };
      }

      this.hasParty = false;
      this.partyNotExistError = false;
      if (this.hero.party && this.hero.party._id) {
        let party;
        try {
          party = await this.$store.dispatch('hall:getHeroParty', { groupId: this.hero.party._id });
          this.hasParty = true;
          this.party = { ...party };
        } catch (e) {
          // the API's error message isn't worth reporting ("Request failed with status code 404")
          this.partyNotExistError = true;
        }
      }

      this.resetCounter += 1; // tell child components to reinstantiate from scratch
    },
  },
};
</script>
