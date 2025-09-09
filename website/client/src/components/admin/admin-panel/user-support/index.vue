<template>
  <div v-if="hasPermission(user, 'userSupport')">
    <div
      v-if="hero && hero.profile"
      class="row"
    >
      <div class="form col-12">
        <button
          class="btn btn-danger mt-3 float-right"
          @click="confirmDeleteHero"
        >
          Begin Member deletion
        </button>
        <basic-details
          :user-id="hero._id"
          :auth="hero.auth"
          :preferences="hero.preferences"
          :profile="hero.profile"
        />

        <privileges-and-gems
          :hero="hero"
          :reset-counter="resetCounter"
          :has-unsaved-changes="hasUnsavedChanges([hero.flags, unModifiedHero.flags],
                                                  [hero.auth, unModifiedHero.auth],
                                                  [hero.balance, unModifiedHero.balance],
                                                  [hero.secret, unModifiedHero.secret])"
        />

        <subscription-and-perks
          :hero="hero"
          :group-plans="groupPlans"
          :has-unsaved-changes="hasUnsavedChanges([hero.purchased.plan,
                                                   unModifiedHero.purchased.plan])"
        />

        <cron-and-auth
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <user-profile
          :hero="hero"
          :reset-counter="resetCounter"
          :has-unsaved-changes="hasUnsavedChanges([hero.profile, unModifiedHero.profile])"
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

        <stats
          :hero="hero"
          :has-unsaved-changes="hasUnsavedChanges([hero.stats, unModifiedHero.stats])"
          :reset-counter="resetCounter"
        />

        <items-owned
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <customizations-owned
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <achievements
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <transactions
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <user-history
          :hero="hero"
          :reset-counter="resetCounter"
        />

        <contributor-details
          :hero="hero"
          :has-unsaved-changes="hasUnsavedChanges(
            [hero.contributor, unModifiedHero.contributor],
            [hero.permissions, unModifiedHero.permissions],
            [hero.secret, unModifiedHero.secret],
          )"
          :reset-counter="resetCounter"
          @clear-data="clearData"
        />
        <b-modal
          id="delete-member-modal"
          title="Delete Member"
          ok-title="Delete"
          ok-variant="danger"
          cancel-title="Cancel"
          @ok="deleteHero"
        >
          <b-modal-body>
            <p>
              Are you sure you want to delete this member?
            </p>
            <p class="errorMessage">
              Please note: This action cannot be undone!
            </p>
            <div class="ml-4">
              <div class="form-check">
                <input
                  id="deleteAccountCheck"
                  v-model="deleteHabiticaAccount"
                  class="form-check-input"
                  type="checkbox"
                >
                <label
                  class="form-check-label"
                  for="deleteAccountCheck"
                >
                  Delete Habitica account
                </label>
              </div>
              <div class="form-check">
                <input
                  id="deleteAmplitudeCheck"
                  v-model="deleteAmplitudeData"
                  class="form-check-input"
                  type="checkbox"
                >
                <label
                  class="form-check-label"
                  for="deleteAmplitudeCheck"
                >
                  Delete Amplitude data
                </label>
              </div>
            </div>
          </b-modal-body>
        </b-modal>
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
import isEqualWith from 'lodash/isEqualWith';
import BasicDetails from './basicDetails';
import ItemsOwned from './itemsOwned';
import CronAndAuth from './cronAndAuth';
import UserProfile from './userProfile';
import PartyAndQuest from './partyAndQuest';
import AvatarAndDrops from './avatarAndDrops';
import PrivilegesAndGems from './privilegesAndGems';
import ContributorDetails from './contributorDetails';
import Transactions from './transactions';
import SubscriptionAndPerks from './subscriptionAndPerks';
import CustomizationsOwned from './customizationsOwned.vue';
import Achievements from './achievements.vue';
import UserHistory from './userHistory.vue';
import Stats from './stats.vue';

import { userStateMixin } from '../../../../mixins/userState';

export default {
  components: {
    BasicDetails,
    ItemsOwned,
    CustomizationsOwned,
    CronAndAuth,
    PartyAndQuest,
    AvatarAndDrops,
    PrivilegesAndGems,
    ContributorDetails,
    Transactions,
    UserHistory,
    Stats,
    SubscriptionAndPerks,
    UserProfile,
    Achievements,
  },
  mixins: [userStateMixin],
  beforeRouteUpdate (to, from, next) {
    this.userIdentifier = to.params.userIdentifier;
    next();
  },
  data () {
    return {
      userIdentifier: '',
      resetCounter: 0,
      unModifiedHero: {},
      hero: {},
      party: {},
      groupPlans: [],
      hasParty: false,
      partyNotExistError: false,
      adminHasPrivForParty: true,
      deleteHabiticaAccount: true,
      deleteAmplitudeData: true,
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
      this.unModifiedHero = {};
      this.hero = {};
    },

    async loadHero (userIdentifier) {
      const id = userIdentifier.replace(/@/, ''); // allow "@name" to be entered
      this.$emit('changeUserIdentifier', id); // change user identifier in Admin Panel's form

      this.hero = await this.$store.dispatch('hall:getHero', { uuid: id });
      this.unModifiedHero = JSON.parse(JSON.stringify(this.hero));

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

      if (this.hero.purchased.plan.planId === 'group_plan_auto') {
        try {
          this.groupPlans = await this.$store.dispatch('hall:getHeroGroupPlans', { heroId: this.hero._id });
        } catch (e) {
          this.groupPlans = [];
        }
      }

      this.resetCounter += 1; // tell child components to reinstantiate from scratch
    },
    confirmDeleteHero () {
      if (this.hero._id === this.user._id) {
        window.alert('You cannot delete your own account.');
        return;
      }
      this.$root.$emit('bv::show::modal', 'delete-member-modal');
    },
    deleteHero () {
      this.$store.dispatch('hall:deleteHero', {
        uuid: this.hero._id,
        deleteHabiticaAccount: this.deleteHabiticaAccount,
        deleteAmplitudeData: this.deleteAmplitudeData,
      }).then(() => {
        this.$root.$emit('bv::hide::modal', 'delete-member-modal');
        this.$router.push({ name: 'adminPanel' });
      }).catch(err => {
        window.alert(err);
      });
    },
    hasUnsavedChanges (...comparisons) {
      for (const index in comparisons) {
        if (index && comparisons[index]) {
          const objs = comparisons[index];
          const obj1 = objs[0];
          const obj2 = objs[1];
          if (!isEqualWith(obj1, obj2, (x, y) => {
            if (typeof x === 'object' && typeof y === 'object') {
              return undefined;
            }
            if (x === false && y === undefined) {
              // Special case for checkboxes
              return true;
            }
            return x == y; // eslint-disable-line eqeqeq
          })) {
            return true;
          }
        }
      }
      return false;
    },
  },
};
</script>
