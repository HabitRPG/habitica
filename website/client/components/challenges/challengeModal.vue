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
        b-form-input(type="text", :placeholder="$t('challengeNamePlaceHolder')", v-model="workingChallenge.shortName")
      .form-group
        label
          strong(v-once) {{$t('description')}}*
        div.description-count.float-right {{charactersRemaining}} {{ $t('charactersRemaining') }}
        b-form-input.description-textarea(type="text", textarea, :placeholder="$t('challengeDescriptionPlaceHolder')", v-model="workingChallenge.description")
      // @TODO: Implemenet in V2 .form-group
        label
          strong(v-once) {{$t('guildInformation')}}*
        a.float-right {{ $t('markdownFormattingHelp') }}
        b-form-input.information-textarea(type="text", textarea, :placeholder="$t('challengeInformationPlaceHolder')", v-model="workingChallenge.information")
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
        input(type='number', min='1', :max='maxPrize')
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
      width: 130px;
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
      top: -40px !important;
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
  props: ['challenge'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    bFormInput,
  },
  data () {
    let categoryOptions = [
      {
        label: 'animals',
        key: 'animals',
      },
      {
        label: 'artDesign',
        key: 'art_design',
      },
      {
        label: 'booksWriting',
        key: 'books_writing',
      },
      {
        label: 'comicsHobbies',
        key: 'comics_hobbies',
      },
      {
        label: 'diyCrafts',
        key: 'diy_crafts',
      },
      {
        label: 'education',
        key: 'education',
      },
      {
        label: 'foodCooking',
        key: 'food_cooking',
      },
      {
        label: 'healthFitness',
        key: 'health_fitness',
      },
      {
        label: 'music',
        key: 'music',
      },
      {
        label: 'relationship',
        key: 'relationship',
      },
      {
        label: 'scienceTech',
        key: 'science_tech ',
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
    createChallenge () {
      if (!this.workingChallenge.name) alert('Name is required');
      if (!this.workingChallenge.description) alert('Description is required');

      this.workingChallenge.timestamp = new Date().getTime();

      this.$store.dispatch('challenges:createChallenge', {challenge: this.workingChallenge});

      this.ressetWorkingChallenge();
      this.$root.$emit('hide::modal', 'challenge-modal');
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
