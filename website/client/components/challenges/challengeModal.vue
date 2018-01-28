<template lang="pug">
  b-modal#challenge-modal(:title="title", size='lg', @shown="shown")
    .form
      .form-group
        label
          strong(v-once) {{$t('name')}} *
        b-form-input(type="text", :placeholder="$t('challengeNamePlaceholder')", v-model="workingChallenge.name")
      .form-group
        label
          strong(v-once) {{$t('shortName')}} *
        b-form-input(type="text", :placeholder="$t('shortNamePlaceholder')", v-model="workingChallenge.shortName")
      .form-group
        label
          strong(v-once) {{$t('challengeSummary')}} *
        div.summary-count {{ $t('charactersRemaining', {characters: charactersRemaining}) }}
        textarea.summary-textarea.form-control(:placeholder="$t('challengeSummaryPlaceholder')", v-model="workingChallenge.summary")
      .form-group
        label
          strong(v-once) {{$t('challengeDescription')}} *
        a.float-right(v-markdown='$t("markdownFormattingHelp")')
        textarea.description-textarea.form-control(:placeholder="$t('challengeDescriptionPlaceholder')", v-model="workingChallenge.description")
      .form-group(v-if='creating')
        label
          strong(v-once) {{$t('challengeGuild')}} *
        select.form-control(v-model='workingChallenge.group')
          option(v-for='group in groups', :value='group._id') {{group.name}}
      .form-group(v-if='workingChallenge.categories')
        label
          strong(v-once) {{$t('categories')}} *
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='workingChallenge.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in workingChallenge.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
            v-if='group.key !== "habitica_official" || user.contributor.admin'
          )
            .custom-control.custom-checkbox
              input.custom-control-input(type="checkbox",
                :value="group.key",
                :id="group.key",
                 v-model="workingChallenge.categories")
              label.custom-control-label(v-once, :for="group.key") {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}
      // @TODO: Implement in V2 .form-group
        label
          strong(v-once) {{$t('endDate')}}
        b-form-input.end-date-input
      .form-group(v-if='creating')
        label
          strong(v-once) {{$t('prize')}}
        input(type='number', :min='minPrize', :max='maxPrize', v-model="workingChallenge.prize")
      .row.footer-wrap
        .col-12.text-center.submit-button-wrapper
          .alert.alert-warning(v-if='insufficientGemsForTavernChallenge')
            You do not have enough gems to create a Tavern challenge
            // @TODO if buy gems button is added, add analytics tracking to it
            // see https://github.com/HabitRPG/habitica/blob/develop/website/views/options/social/challenges.jade#L134
          button.btn.btn-primary(v-if='creating && !cloning', @click='createChallenge()', :disabled='loading') {{$t('createChallengeAddTasks')}}
          button.btn.btn-primary(v-once, v-if='cloning', @click='createChallenge()', :disabled='loading') {{$t('createChallengeCloneTasks')}}
          button.btn.btn-primary(v-once, v-if='!creating && !cloning', @click='updateChallenge()') {{$t('updateChallenge')}}
        .col-12.text-center
          p(v-once) {{$t('challengeMinimum')}}
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

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

import markdownDirective from 'client/directives/markdown';

import { TAVERN_ID, MIN_SHORTNAME_SIZE_FOR_CHALLENGES, MAX_SUMMARY_SIZE_FOR_CHALLENGES } from '../../../common/script/constants';
import { mapState } from 'client/libs/store';

export default {
  props: ['groupId', 'cloning'],
  directives: {
    markdown: markdownDirective,
  },
  data () {
    let categoryOptions = [
      {
        label: 'habitica_official',
        key: 'habitica_official',
      },
      {
        label: 'academics',
        key: 'academics',
      },
      {
        label: 'advocacy_causes',
        key: 'advocacy_causes',
      },
      {
        label: 'creativity',
        key: 'creativity',
      },
      {
        label: 'entertainment',
        key: 'entertainment',
      },
      {
        label: 'finance',
        key: 'finance',
      },
      {
        label: 'health_fitness',
        key: 'health_fitness',
      },
      {
        label: 'hobbies_occupations',
        key: 'hobbies_occupations',
      },
      {
        label: 'location_based',
        key: 'location_based',
      },
      {
        label: 'mental_health',
        key: 'mental_health',
      },
      {
        label: 'getting_organized',
        key: 'getting_organized',
      },
      {
        label: 'self_improvement',
        key: 'self_improvement',
      },
      {
        label: 'spirituality',
        key: 'spirituality',
      },
      {
        label: 'time_management',
        key: 'time_management',
      },
    ];
    let hashedCategories = {};
    categoryOptions.forEach((category) => {
      hashedCategories[category.key] = category.label;
    });
    let categoriesHashByKey = hashedCategories;

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
      showCategorySelect: false,
      categoryOptions,
      categoriesHashByKey,
      loading: false,
      groups: [],
    };
  },
  async mounted () {},
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
  computed: {
    ...mapState({user: 'user.data'}),
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
      let currentLength = this.workingChallenge.summary ? this.workingChallenge.summary.length : 0;
      return MAX_SUMMARY_SIZE_FOR_CHALLENGES - currentLength;
    },
    maxPrize () {
      let userBalance = this.user.balance || 0;
      userBalance = userBalance * 4;

      let groupBalance = 0;
      let group;
      this.groups.forEach(item => {
        if (item._id === this.workingChallenge.group) {
          group = item;
          return;
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
      let balance = this.user.balance || 0;
      let isForTavern = this.workingChallenge.group === TAVERN_ID;

      if (isForTavern) {
        return balance <= 0;
      } else {
        return false;
      }
    },
    challenge () {
      return this.$store.state.challengeOptions.workingChallenge;
    },
  },
  methods: {
    async shown () {
      this.groups = await this.$store.dispatch('guilds:getMyGuilds');
      await this.$store.dispatch('party:getParty');
      const party = this.$store.state.party.data;
      if (party._id) {
        this.groups.push({
          name: party.name,
          _id: party._id,
          privacy: 'private',
        });
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

      this.workingChallenge = Object.assign({}, this.workingChallenge, this.challenge);
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
      // @TODO: improve error handling, add it to updateChallenge, make errors translatable. Suggestion: `<% fieldName %> is required` where possible, where `fieldName` is inserted as the translatable string that's used for the field header.
      let errors = [];

      if (!this.workingChallenge.name) errors.push(this.$t('nameRequired'));
      if (this.workingChallenge.shortName.length < MIN_SHORTNAME_SIZE_FOR_CHALLENGES) errors.push(this.$t('tagTooShort'));
      if (!this.workingChallenge.summary) errors.push(this.$t('summaryRequired'));
      if (this.workingChallenge.summary.length > MAX_SUMMARY_SIZE_FOR_CHALLENGES) errors.push(this.$t('summaryTooLong'));
      if (!this.workingChallenge.description) errors.push(this.$t('descriptionRequired'));
      if (!this.workingChallenge.group) errors.push(this.$t('locationRequired'));
      if (!this.workingChallenge.categories || this.workingChallenge.categories.length === 0) errors.push(this.$t('categoiresRequired'));

      if (errors.length > 0) {
        alert(errors.join('\n'));
        this.loading = false;
        return;
      }

      this.workingChallenge.timestamp = new Date().getTime();
      let categoryKeys = this.workingChallenge.categories;
      let serverCategories = [];
      categoryKeys.forEach(key => {
        let catName = this.categoriesHashByKey[key];
        serverCategories.push({
          slug: key,
          name: catName,
        });
      });

      let challengeDetails = clone(this.workingChallenge);
      challengeDetails.categories = serverCategories;

      let challenge = await this.$store.dispatch('challenges:createChallenge', {challenge: challengeDetails});
      // @TODO: When to remove from guild instead?
      this.user.balance -= this.workingChallenge.prize / 4;

      this.$emit('createChallenge', challenge);
      this.resetWorkingChallenge();

      if (this.cloning) this.$store.state.challengeOptions.cloning = true;

      this.$root.$emit('bv::hide::modal', 'challenge-modal');
      this.$router.push(`/challenges/${challenge._id}`);
    },
    updateChallenge () {
      let categoryKeys = this.workingChallenge.categories;
      let serverCategories = [];
      categoryKeys.forEach(key => {
        let newKey = key.trim();
        let catName = this.categoriesHashByKey[newKey];
        serverCategories.push({
          slug: newKey,
          name: catName,
        });
      });

      let challengeDetails = clone(this.workingChallenge);
      challengeDetails.categories = serverCategories;

      this.$emit('updatedChallenge', {
        challenge: challengeDetails,
      });
      this.$store.dispatch('challenges:updateChallenge', {challenge: challengeDetails});
      this.resetWorkingChallenge();
      this.$root.$emit('bv::hide::modal', 'challenge-modal');
    },
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
  },
};
</script>
