<template>
  <div v-if="hasPermission(user, 'userSupport')">
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

        <subscription-and-perks
          :hero="hero"
        />

        <cron-and-auth
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <party-and-quest
          v-if="adminHasPrivForParty"
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

        <transactions
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
</template>

<style lang="scss" scoped>
  ::v-deep .accordion-group .accordion-group {
    margin-left: 1em;
  }
  ::v-deep h3 {
    margin-top: 2em;
  }
  ::v-deep h4 {
    margin-top: 1em;
  }
  ::v-deep .expand-toggle::after {
    margin-left: 5px;
  }
  ::v-deep .subsection-start {
    margin-top: 1em;
  }
  ::v-deep .form-inline {
    margin-bottom: 1em;
    input, span {
      margin-left: 5px;
    }
  }
  ::v-deep .errorMessage {
    font-weight: bold;
  }
  ::v-deep .markdownPreview {
    margin-left: 3em;
    margin-top: 1em;
  }
</style>

<script>
import BasicDetails from './basicDetails';
import ItemsOwned from './itemsOwned';
import CronAndAuth from './cronAndAuth';
import PartyAndQuest from './partyAndQuest';
import AvatarAndDrops from './avatarAndDrops';
import PrivilegesAndGems from './privilegesAndGems';
import ContributorDetails from './contributorDetails';
import Transactions from './transactions';
import SubscriptionAndPerks from './subscriptionAndPerks';

import { userStateMixin } from '../../../mixins/userState';

export default {
  components: {
    BasicDetails,
    ItemsOwned,
    CronAndAuth,
    PartyAndQuest,
    AvatarAndDrops,
    PrivilegesAndGems,
    ContributorDetails,
    Transactions,
    SubscriptionAndPerks,
  },
  mixins: [userStateMixin],
  data () {
    return {
      userIdentifier: '',
      resetCounter: 0,
      hero: {},
      party: {},
      hasParty: false,
      partyNotExistError: false,
      adminHasPrivForParty: true,
    };
  },
  watch: {
    userIdentifier () {
      // close modal if the page is opened in an existing tab from the modal
      this.$root.$emit('bv::hide::modal', 'profile');

      this.loadHero(this.userIdentifier);
    },
  },
  mounted () {
    this.userIdentifier = this.$route.params.userIdentifier;
  },
  methods: {
    clearData () {
      this.hero = {};
    },

    async loadHero (userIdentifier) {
      const id = userIdentifier.replace(/@/, ''); // allow "@name" to be entered
      this.$emit('changeUserIdentifier', id); // change user identifier in Admin Panel's form

      this.hero = await this.$store.dispatch('hall:getHero', { uuid: id });

      if (!this.hero.flags) {
        this.hero.flags = {
          chatRevoked: false,
          chatShadowMuted: false,
        };
      }

      if (!this.hero.permissions) {
        this.hero.permissions = {};
      }

      this.hasParty = false;
      this.partyNotExistError = false;
      this.adminHasPrivForParty = true;
      if (this.hero.party && this.hero.party._id) {
        try {
          this.party = await this.$store.dispatch('hall:getHeroParty', { groupId: this.hero.party._id });
          this.hasParty = true;
        } catch (e) {
          if (e.message.includes('status code 401')) {
            // @TODO is there a better way to recognise NotAuthorized error?
            this.adminHasPrivForParty = false;
          } else {
            // the API's error message isn't worth reporting ("Request failed with status code 404")
            this.partyNotExistError = true;
          }
        }
      }

      this.resetCounter += 1; // tell child components to reinstantiate from scratch
    },
  },
  beforeRouteUpdate (to, from, next) {
    this.userIdentifier = to.params.userIdentifier;
    next();
  },
};
</script>
