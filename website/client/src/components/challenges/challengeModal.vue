<template>
  <b-modal
    id="challenge-modal"
    :title="title"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
    size="lg"
    @shown="shown"
  >
    <div class="form">
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('name') }} *</strong>
        </label>
        <b-form-input
          v-model="workingChallenge.name"
          type="text"
          :placeholder="$t('challengeNamePlaceholder')"
          @keydown="enableSubmit"
        />
      </div>
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('shortName') }} *</strong>
        </label>
        <b-form-input
          v-model="workingChallenge.shortName"
          type="text"
          :placeholder="$t('shortNamePlaceholder')"
          @keydown="enableSubmit"
        />
      </div>
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('challengeSummary') }} *</strong>
        </label>
        <div
          class="summary-count"
        >
          {{ $t('charactersRemaining', {characters: charactersRemaining}) }}
        </div>
        <textarea
          v-model="workingChallenge.summary"
          class="summary-textarea form-control"
          :placeholder="$t('challengeSummaryPlaceholder')"
          @keydown="enableSubmit"
        ></textarea>
      </div>
      <div class="form-group">
        <label>
          <strong v-once>{{ $t('challengeDescription') }} *</strong>
        </label>
        <a
          v-markdown="$t('markdownFormattingHelp')"
          class="float-right"
        ></a>
        <textarea
          v-model="workingChallenge.description"
          class="description-textarea form-control"
          :placeholder="$t('challengeDescriptionPlaceholder')"
          @keydown="enableSubmit"
        ></textarea>
      </div>
      <div
        v-if="creating"
        class="form-group"
      >
        <label>
          <strong v-once>{{ $t('challengeGuild') }} *</strong>
        </label>
        <select
          v-model="workingChallenge.group"
          class="form-control"
          @change="enableSubmit"
        >
          <option
            v-for="group in groups"
            :key="group._id"
            :value="group._id"
          >
            {{ group.name }}
          </option>
        </select>
      </div>
      <div
        v-if="workingChallenge.categories"
        class="form-group"
      >
        <label>
          <strong v-once>{{ $t('categories') }} *</strong>
        </label>
        <div
          class="category-wrap"
          @click.prevent="toggleCategorySelect"
        >
          <span
            v-if="workingChallenge.categories.length === 0"
            class="category-select"
          >{{ $t('none') }}</span>
          <div
            v-for="category in workingChallenge.categories"
            :key="category"
            class="category-label"
          >
            {{ $t(categoriesHashByKey[category]) }}
          </div>
        </div>
        <div
          v-if="showCategorySelect"
          class="category-box"
        >
          <!-- eslint-disable vue/no-use-v-if-with-v-for -->
          <div
            v-for="group in categoryOptions"
            v-if="group.key !== 'habitica_official' || hasPermission(user, 'challengeAdmin')"
            :key="group.key"
            class="form-check"
          >
            <!-- eslint-enable vue/no-use-v-if-with-v-for -->
            <div class="custom-control custom-checkbox">
              <input
                :id="`challenge-modal-cat-${group.key}`"
                v-model="workingChallenge.categories"
                class="custom-control-input"
                type="checkbox"
                :value="group.key"
                @change="enableSubmit"
              >
              <label
                v-once
                class="custom-control-label"
                :for="`challenge-modal-cat-${group.key}`"
              >{{ $t(group.label) }}</label>
            </div>
          </div>
          <button
            class="btn btn-primary"
            @click.prevent="toggleCategorySelect"
          >
            {{ $t('close') }}
          </button>
        </div>
      </div>
      <!-- @TODO: Implement in V2 .form-grouplabel
  strong(v-once) {{$t('endDate')}}
      b-form-input.end-date-input-->
      <div
        v-if="creating"
        class="form-group"
      >
        <label>
          <strong v-once>{{ $t('prize') }}</strong>
        </label>
        <input
          v-model="workingChallenge.prize"
          type="number"
          class="form-control"
          :min="minPrize"
          :max="maxPrize"
          @change="enableSubmit"
        >
      </div>
      <div class="row footer-wrap">
        <div class="col-12 text-center submit-button-wrapper">
          <div
            v-if="insufficientGemsForTavernChallenge"
            class="alert alert-warning"
          >
            You do not have enough gems to create a Tavern challenge
          </div>
          <!-- @TODO if buy gems button is added, add analytics tracking to it-->
          <!-- see https://github.com/HabitRPG/habitica/blob/develop/website/views/options/social/challenges.jade#L134-->
          <button
            v-if="creating && !cloning"
            class="btn btn-primary"
            :disabled="loading"
            @click="createChallenge()"
          >
            {{ $t('createChallengeAddTasks') }}
          </button>
          <button
            v-if="cloning"
            v-once
            class="btn btn-primary"
            :disabled="loading"
            @click="createChallenge()"
          >
            {{ $t('createChallengeCloneTasks') }}
          </button>
          <button
            v-if="!creating && !cloning"
            v-once
            class="btn btn-primary"
            @click="updateChallenge()"
          >
            {{ $t('updateChallenge') }}
          </button>
        </div>
        <div class="col-12 text-center">
          <p v-once>
            {{ $t('challengeMinimum') }}
          </p>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss'>
  @import '~@/assets/scss/colors.scss';

  #challenge-modal {
    h5 {
      color: $purple-200;
      margin-bottom: 1.5em;
    }

    .modal-header {
      border: none;
    }

    .modal-footer {
      display: none;
    }

    .summary-count {
      font-size: 12px;
      line-height: 1.33;
      margin-top: 1em;
      color: $gray-200;
      text-align: right;
    }

    .summary-textarea {
      height: 90px;
    }

    .description-textarea {
      height: 220px;
    }

    label {
      margin-right: .5em;
    }

    .end-date-input {
      width: 150px;
      display: inline-block;
    }

    .form-group {
      margin-bottom: 2em;
    }

    .submit-button-wrapper {
      margin-bottom: .5em;
    }

    .footer-wrap {
      margin-top: 2em;
      margin-bottom: 2em;
    }

    .category-wrap {
      position: relative;
    }

    .category-box {
      top: 20em !important;
      z-index: 10;
    }
  }
</style>

<script>
import clone from 'lodash/clone';
import throttle from 'lodash/throttle';

import markdownDirective from '@/directives/markdown';
import { userStateMixin } from '../../mixins/userState';

import { TAVERN_ID, MIN_SHORTNAME_SIZE_FOR_CHALLENGES, MAX_SUMMARY_SIZE_FOR_CHALLENGES } from '@/../../common/script/constants';
import CategoryOptions from '@/../../common/script/content/categoryOptions';

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [userStateMixin],
  props: ['groupId'],
  data () {
    const categoryOptions = CategoryOptions;
    const hashedCategories = {};
    categoryOptions.forEach(category => {
      hashedCategories[category.key] = category.label;
    });
    const categoriesHashByKey = hashedCategories;

    return {
      workingChallenge: {
        name: '',
        summary: '',
        description: '',
        categories: [],
        group: '',
        dailys: [],
        habits: [],
        leader: '',
        members: [],
        official: false,
        prize: 1,
        rewards: [],
        shortName: '',
        todos: [],
      },
      cloning: false,
      cloningChallengeId: '',
      showCategorySelect: false,
      categoryOptions,
      categoriesHashByKey,
      loading: false,
      groups: [],
    };
  },
  computed: {
    creating () {
      return !this.workingChallenge.id;
    },
    title () {
      if (this.creating) {
        return this.$t('createChallenge');
      }
      return this.$t('editingChallenge');
    },
    charactersRemaining () {
      const currentLength = this.workingChallenge.summary
        ? this.workingChallenge.summary.length
        : 0;
      return MAX_SUMMARY_SIZE_FOR_CHALLENGES - currentLength;
    },
    maxPrize () {
      let userBalance = this.user.balance || 0;
      userBalance *= 4;

      let groupBalance = 0;
      let group;
      this.groups.forEach(item => {
        if (item._id === this.workingChallenge.group) {
          group = item;
        }
      });

      if (group && group.balance && group.leader === this.user._id) {
        groupBalance = group.balance * 4;
      }

      return userBalance + groupBalance;
    },
    minPrize () {
      if (this.workingChallenge.group === TAVERN_ID) return 1;
      return 0;
    },
    insufficientGemsForTavernChallenge () {
      const balance = this.user.balance || 0;
      const isForTavern = this.workingChallenge.group === TAVERN_ID;

      if (isForTavern) {
        return balance <= 0;
      }
      return false;
    },
    challenge () {
      return this.$store.state.challengeOptions.workingChallenge;
    },
  },
  watch: {
    user () {
      if (!this.challenge) this.workingChallenge.leader = this.user._id;
    },
    challenge () {
      this.setUpWorkingChallenge();
    },
    cloning () {
      this.setUpWorkingChallenge();
    },
  },
  mounted () {
    this.$root.$on('habitica:clone-challenge', data => {
      if (!data.challenge) return;
      this.cloning = true;
      this.cloningChallengeId = data.challenge._id;
      this.$store.state.challengeOptions.workingChallenge = {
        ...this.$store.state.challengeOptions.workingChallenge,
        ...data.challenge,
      };
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    });
    this.$root.$on('habitica:update-challenge', data => {
      if (!data.challenge) return;
      this.cloning = false;
      this.$store.state.challengeOptions.workingChallenge = {
        ...this.$store.state.challengeOptions.workingChallenge,
        ...data.challenge,
      };
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    });
    this.$root.$on('habitica:create-challenge', () => {
      this.cloning = false;
      this.$store.state.challengeOptions.workingChallenge = {};
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:clone-challenge');
    this.$root.$off('habitica:update-challenge');
    this.$root.$off('habitica:create-challenge');
  },
  methods: {
    async shown () {
      this.groups = await this.$store.dispatch('guilds:getMyGuilds');

      if (this.user.party && this.user.party._id) {
        await this.$store.dispatch('party:getParty');
        const party = this.$store.state.party.data;
        if (party._id) {
          this.groups.push({
            name: party.name,
            _id: party._id,
            privacy: 'private',
          });
        }
      }

      this.groups.push({
        name: this.$t('publicChallengesTitle'),
        _id: TAVERN_ID,
      });

      this.setUpWorkingChallenge();
    },
    setUpWorkingChallenge () {
      this.resetWorkingChallenge();

      if (!this.challenge) return;

      this.workingChallenge = { ...this.workingChallenge, ...this.challenge };
      // @TODO: Should we use a separate field? I think the API expects `group` but it is confusing
      this.workingChallenge.group = this.workingChallenge.group._id;
      this.workingChallenge.categories = [];

      if (this.challenge.categories) {
        this.challenge.categories.forEach(category => {
          this.workingChallenge.categories.push(category.slug);
        });
      }

      if (this.cloning) {
        this.$delete(this.workingChallenge, '_id');
        this.$delete(this.workingChallenge, 'id');
      }
    },
    resetWorkingChallenge () {
      this.workingChallenge = {
        name: '',
        summary: '',
        description: '',
        categories: [],
        group: '',
        dailys: [],
        habits: [],
        leader: '',
        members: [],
        official: false,
        prize: 1,
        rewards: [],
        shortName: '',
        todos: [],
      };

      this.$store.state.workingChallenge = {};
    },
    async createChallenge () {
      this.loading = true;
      // @TODO: improve error handling, add it to updateChallenge,
      // make errors translatable. Suggestion: `<% fieldName %>
      // is required` where possible, where `fieldName` is inserted
      // as the translatable string that's used for the field header.
      const errors = [];

      if (!this.workingChallenge.name) errors.push(this.$t('nameRequired'));
      if (this.workingChallenge.shortName.length < MIN_SHORTNAME_SIZE_FOR_CHALLENGES) errors.push(this.$t('tagTooShort'));
      if (!this.workingChallenge.summary) errors.push(this.$t('summaryRequired'));
      if (this.workingChallenge.summary.length > MAX_SUMMARY_SIZE_FOR_CHALLENGES) errors.push(this.$t('summaryTooLong'));
      if (!this.workingChallenge.description) errors.push(this.$t('descriptionRequired'));
      if (!this.workingChallenge.group) errors.push(this.$t('locationRequired'));
      if (!this.workingChallenge.categories || this.workingChallenge.categories.length === 0) errors.push(this.$t('categoiresRequired'));
      if (this.workingChallenge.prize > this.maxPrize) errors.push(this.$t('cantAfford'));

      if (errors.length > 0) {
        window.alert(errors.join('\n')); // eslint-disable-line no-alert
        this.loading = false;
        return;
      }

      this.workingChallenge.timestamp = new Date().getTime();
      const categoryKeys = this.workingChallenge.categories;
      const serverCategories = [];
      categoryKeys.forEach(key => {
        const catName = this.categoriesHashByKey[key];
        serverCategories.push({
          slug: key,
          name: catName,
        });
      });

      const challengeDetails = clone(this.workingChallenge);
      challengeDetails.categories = serverCategories;

      let challenge;
      try {
        if (this.cloning) {
          challenge = await this.$store.dispatch('challenges:cloneChallenge', {
            challenge: challengeDetails,
            cloningChallengeId: this.cloningChallengeId,
          });
          this.cloningChallengeId = '';
        } else {
          challenge = await this.$store.dispatch('challenges:createChallenge', { challenge: challengeDetails });
        }
      } catch (e) {
        // creating the challenge failed. Most probably due to server-side errors.
        console.error(e); // eslint-disable-line no-console
        return;
      }

      // Update Group Prize
      const challengeGroup = this.groups.find(group => group._id === this.workingChallenge.group);

      // @TODO: Share with server
      const prizeCost = this.workingChallenge.prize / 4;
      const challengeGroupLeader = challengeGroup.leader && challengeGroup.leader._id
        ? challengeGroup.leader._id
        : challengeGroup.leader;
      const userIsLeader = challengeGroupLeader === this.user._id;
      if (
        challengeGroup && userIsLeader
        && challengeGroup.balance > 0 && challengeGroup.balance >= prizeCost
      ) {
        // Group pays for all of prize
      } else if (challengeGroup && userIsLeader && challengeGroup.balance > 0) {
        // User pays remainder of prize cost after group
        const remainder = prizeCost - challengeGroup.balance;
        this.user.balance -= remainder;
      } else {
        // User pays for all of prize
        this.user.balance -= prizeCost;
      }

      this.$emit('createChallenge', challenge);
      this.resetWorkingChallenge();

      this.$root.$emit('bv::hide::modal', 'challenge-modal');
      this.$router.push(`/challenges/${challenge._id}`);
    },
    async updateChallenge () {
      const categoryKeys = this.workingChallenge.categories;
      const serverCategories = [];
      categoryKeys.forEach(key => {
        const newKey = key.trim();
        const catName = this.categoriesHashByKey[newKey];
        serverCategories.push({
          slug: newKey,
          name: catName,
        });
      });

      const challengeDetails = clone(this.workingChallenge);
      challengeDetails.categories = serverCategories;

      const challenge = await this.$store.dispatch('challenges:updateChallenge', { challenge: challengeDetails });
      this.$emit('updatedChallenge', { challenge });
      this.resetWorkingChallenge();
      this.$root.$emit('bv::hide::modal', 'challenge-modal');
    },
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
    enableSubmit: throttle(function enableSubmit () {
      /* Enables the submit button if it was disabled */
      if (this.loading) {
        this.loading = false;
      }
    }, 250),
  },
};
</script>
