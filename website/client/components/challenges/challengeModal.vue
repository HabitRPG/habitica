<template lang="pug">
div
  b-modal#challenge-modal(:title="$t('createChallenge')", size='lg')
    form(@submit.stop.prevent="submit")
      .form-group
        label
          strong(v-once) {{$t('name')}}*
        b-form-input(type="text", :placeholder="$t('challengeNamePlaceHolder')", v-model="workingChallenge.name")
      .form-group
        label
          strong(v-once) {{$t('description')}}*
        div.description-count.float-right {{charactersRemaining}} {{ $t('charactersRemaining') }}
        b-form-input.description-textarea(type="text", textarea, :placeholder="$t('challengeDescriptionPlaceHolder')", v-model="workingChallenge.description")
      .form-group
        label
          strong(v-once) {{$t('guildInformation')}}*
        a.float-right {{ $t('markdownFormattingHelp') }}
        b-form-input.information-textarea(type="text", textarea, :placeholder="$t('challengeInformationPlaceHolder')", v-model="workingChallenge.information")
      .form-group(v-if='creating')
        label
          strong(v-once) {{$t('where')}}
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
      .form-group
        label
          strong(v-once) {{$t('categories')}}*
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
            | Member
      .form-group
        label
          strong(v-once) {{$t('endDate')}}
        b-form-input.end-date-input
      .form-group
        label
          strong(v-once) {{$t('prize')}}
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
            | Member
      .row.footer-wrap
        .col-12.text-center.submit-button-wrapper
          button.btn.btn-primary(v-once) {{$t('createChallenge')}}
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
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import bFormInput from 'bootstrap-vue/lib/components/form-input';

export default {
  props: ['challenge'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    bFormInput,
  },
  data () {
    return {
      creating: true,
      charactersRemaining: 250,
      workingChallenge: {
        name: '',
        description: '',
        information: '',
      },
    };
  },
  mounted () {
    if (this.challenge) {
      this.workingChallenge = this.challenge;
      this.creating = false;
    }
  },
  computed: {
    maxPrize () {
      // var groupBalance = 0;
      // var group = _.find($scope.groups, { _id: gid });
      //
      // if (group && group.balance && group.leader === User.user._id) {
      //   groupBalance = group.balance * 4;
      // }
      //
      // return groupBalance;
      // return userBalance + availableGroupBalance;
    },
    insufficientGemsForTavernChallenge () {
      // var balance = User.user.balance || 0;
      // var isForTavern = $scope.newChallenge.group == TAVERN_ID;
      //
      // if (isForTavern) {
      //   return balance <= 0;
      // } else {
      //   return false;
      // }
    },
  },
  methods: {
    createChallenge () {
      // this.$store.dispatch('challenges:createChallenge', {challenge: this.workingChallenge});
    },
    updateChallenge () {
      // this.$store.dispatch('challenges:updateChallenge', {challenge: this.workingChallenge});
    },
  },
};
</script>
