<template lang="pug">
  b-modal#challenge-modal(:title="$t('createChallenge')", size='lg')
    .form
      .form-group
        label
          strong(v-once) {{$t('name')}}*
        b-form-input(type="text", :placeholder="$t('challengeNamePlaceHolder')", v-model="workingChallenge.name")
      .form-group
        label
          strong(v-once) {{$t('shortName')}}*
        b-form-input(type="text", :placeholder="$t('shortNamePlaceholder')", v-model="workingChallenge.shortName")
      .form-group
        label
          strong(v-once) {{$t('description')}}*
        div.description-count.float-right {{charactersRemaining}} {{ $t('charactersRemaining') }}
        b-form-input.description-textarea(type="text", textarea, :placeholder="$t('challengeDescriptionPlaceHolder')", v-model="workingChallenge.description")
      .form-group
        label
          strong(v-once) Challenge Information*
        a.float-right {{ $t('markdownFormattingHelp') }}
        b-form-input.information-textarea(type="text", textarea,
          :placeholder="$t('challengeInformationPlaceHolder')", v-model="workingChallenge.description")
      .form-group(v-if='creating')
        label
          strong(v-once) {{$t('where')}}
        select.form-control(v-model='workingChallenge.group')
          option(v-for='group in groups', :value='group._id') {{group.name}}
      .form-group(v-if='workingChallenge.categories')
        label
          strong(v-once) {{$t('categories')}}*
        div.category-wrap(@click.prevent="toggleCategorySelect")
          span.category-select(v-if='workingChallenge.categories.length === 0') {{$t('none')}}
          .category-label(v-for='category in workingChallenge.categories') {{$t(categoriesHashByKey[category])}}
        .category-box(v-if="showCategorySelect")
          .form-check(
            v-for="group in categoryOptions",
            :key="group.key",
          )
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value='group.key' v-model="workingChallenge.categories")
              span.custom-control-indicator
              span.custom-control-description(v-once) {{ $t(group.label) }}
          button.btn.btn-primary(@click.prevent="toggleCategorySelect") {{$t('close')}}
      // @TODO: Implement in V2 .form-group
        label
          strong(v-once) {{$t('endDate')}}
        b-form-input.end-date-input
      .form-group
        label
          strong(v-once) {{$t('prize')}}
        input(type='number', min='1', :max='maxPrize', v-model="workingChallenge.prize")
      .row.footer-wrap
        .col-12.text-center.submit-button-wrapper
          .alert.alert-warning(v-if='insufficientGemsForTavernChallenge')
            You do not have enough gems to create a Tavern challenge
          button.btn.btn-primary(v-once, v-if='creating', @click='createChallenge()') {{$t('createChallenge')}}
          button.btn.btn-primary(v-once, v-if='!creating', @click='updateChallenge()') {{$t('updateChallenge')}}
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

    .description-textarea {
      height: 90px;
    }

    .information-textarea {
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
      top: -120px !important;
      z-index: 10;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import bFormInput from 'bootstrap-vue/lib/components/form-input';

import { TAVERN_ID } from '../../../common/script/constants';
import { mapState } from 'client/libs/store';

export default {
  props: ['challenge', 'groupId'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    bFormInput,
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
        key: 'mental_health ',
      },
      {
        label: 'getting_organized',
        key: 'getting_organized ',
      },
      {
        label: 'self_improvement',
        key: 'self_improvement ',
      },
      {
        label: 'spirituality',
        key: 'spirituality ',
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
      creating: true,
      charactersRemaining: 250,
      workingChallenge: {},
      showCategorySelect: false,
      categoryOptions,
      categoriesHashByKey,
      groups: [],
    };
  },
  async mounted () {
    this.$root.$on('shown::modal', () => {
      if (this.challenge) {
        Object.assign(this.workingChallenge, this.challenge);
        this.workingChallenge.categories = [];
        this.creating = false;
      }
    });

    this.groups = await this.$store.dispatch('guilds:getMyGuilds');
    if (this.user.party._id) {
      let party = await this.$store.dispatch('guilds:getGroup', {groupId: 'party'});
      this.groups.push({
        name: party.name,
        _id: party._id,
      });
    }

    this.groups.push({
      name: 'Public',
      _id: TAVERN_ID,
    });

    this.ressetWorkingChallenge();
  },
  watch: {
    user () {
      if (!this.challenge) this.workingChallenge.leader = this.user._id;
    },
  },
  computed: {
    ...mapState({user: 'user.data'}),
    maxPrize () {
      let userBalance = this.user.balance || 0;
      userBalance = userBalance * 4;

      let groupBalance = 0;
      let group = find(this.groups, { _id: this.workingChallenge.group });

      if (group && group.balance && group.leader === this.user._id) {
        groupBalance = group.balance * 4;
      }

      return userBalance + groupBalance;
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
  },
  methods: {
    ressetWorkingChallenge () {
      this.workingChallenge = {
        name: '',
        description: '',
        information: '',
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
    },
    async createChallenge () {
      if (!this.workingChallenge.name) alert('Name is required');
      if (!this.workingChallenge.description) alert('Description is required');

      this.workingChallenge.timestamp = new Date().getTime();

      let challenge = await this.$store.dispatch('challenges:createChallenge', {challenge: this.workingChallenge});
      // @TODO: When to remove from guild instead?
      this.user.balance -= this.workingChallenge.prize / 4;

      this.$emit('createChallenge', challenge);
      this.ressetWorkingChallenge();
      this.$root.$emit('hide::modal', 'challenge-modal');
      this.$router.push(`/challenges/${challenge._id}`);
    },
    updateChallenge () {
      this.$emit('updatedChallenge', {
        challenge: this.workingChallenge,
      });
      this.$store.dispatch('challenges:updateChallenge', {challenge: this.workingChallenge});
      this.ressetWorkingChallenge();
      this.$root.$emit('hide::modal', 'challenge-modal');
    },
    toggleCategorySelect () {
      this.showCategorySelect = !this.showCategorySelect;
    },
  },
};
</script>
