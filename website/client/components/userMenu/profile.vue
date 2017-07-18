<template lang="pug">
.standard-page
  h2 Profile
  .row
    .col-md-12(v-if='!editing')
      button.btn.btn-default(@click='editing = true') {{ $t('edit') }}
      h2 {{ $t('displayName') }}
      span(v-if='user.profile.name') {{user.profile.name}}
      p
        small.muted {{ $t('displayNameDescription1') }}
          | &nbsp;
          a(href='/#/options/settings/settings') {{ $t('displayNameDescription2') }}
          | &nbsp;
          | {{ $t('displayNameDescription3') }}
      span.muted(ng-hide='user.profile.name') -&nbsp;
        | {{ $t('none') }}
        | &nbsp;-

      h2 {{ $t('displayPhoto') }}
      img.img-rendering-auto(v-if='user.profile.imageUrl', :src='user.profile.imageUrl')
      span.muted(ng-hide='user.profile.imageUrl') -&nbsp;
        | {{ $t('none') }}
        | &nbsp;-

      h2 {{ $t('displayBlurb') }}
      markdown(v-if='user.profile.blurb', text='user.profile.blurb')
      span.muted(ng-hide='user.profile.blurb') -&nbsp;
        | {{ $t('none') }}
        | &nbsp;-
      //{{user.profile.blurb | linky:'_blank'}}
    .col-md-12(v-if='editing')
      .alert.alert-info.alert-sm
        | {{ $t("communityGuidelinesWarning", managerEmail) }}
      button.btn.btn-primary(type='submit', @click='save()') {{ $t("save") }}
      // TODO use photo-upload instead: https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/xMmADvxBOak
      .form-group
        label {{ $t('displayName') }}
        input.form-control(type='text', :placeholder="$t('fullName')", v-model='editingProfile.name')
      .form-group
        label {{ $t('photoUrl') }}
        input.form-control(type='url', v-model='editingProfile.imageUrl', :placeholder="$t('imageUrl')")
      .form-group
        label {{ $t('displayBlurb') }}
        textarea.form-control(rows=5, :placeholder="$t('displayBlurbPlaceholder')", v-model='editingProfile.blurb')
        // include ../../shared/formatting-help
  .row
    .col-md-6
      h2 {{ $t('totalCheckinsTitle') }}
      span {{ $t('totalCheckins', {count: user.loginIncentives}) }}
    .col-md-6
      h2
        | {{getProgressDisplay()}}
      .progress
        .progress-bar(role='progressbar', :aria-valuenow='incentivesProgress', aria-valuemin='0', aria-valuemax='100', :style='{width: incentivesProgress + "%"}')
          span.sr-only {{ incentivesProgress }}% Complete
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  h2 {
    margin-top: 2em;
  }
</style>

<script>
import each from 'lodash/each';
import { mapState } from 'client/libs/store';

// @TODO: EMAILS.COMMUNITY_MANAGER_EMAIL
const COMMUNITY_MANAGER_EMAIL = 'admin@habitica.com';
import Content from '../../../common/script/content';

export default {
  data () {
    return {
      editing: false,
      editingProfile: {
        name: '',
        imageUrl: '',
        blurb: '',
      },
      managerEmail: {
        hrefBlankCommunityManagerEmail: `<a href="mailto:${COMMUNITY_MANAGER_EMAIL}">${COMMUNITY_MANAGER_EMAIL}</a>`,
      },
    };
  },
  mounted () {
    this.editingProfile.name = this.user.profile.name;
    this.editingProfile.imageUrl = this.user.profile.imageUrl;
    this.editingProfile.imageUrl = this.user.profile.imageUrl;
  },
  computed: {
    ...mapState({user: 'user.data'}),
    incentivesProgress () {
      return this.getIncentivesProgress();
    },
  },
  methods: {
    getProgressDisplay () {
      let currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      if (!currentLoginDay) return this.$t('checkinReceivedAllRewardsMessage');
      let nextRewardAt = currentLoginDay.nextRewardAt;
      if (!nextRewardAt) return this.$t('moreIncentivesComingSoon');
      // if we are on a reward day, let's show progress relative to this
      if (currentLoginDay.reward) currentLoginDay.prevRewardKey = this.user.loginIncentives;
      if (!currentLoginDay.prevRewardKey) currentLoginDay.prevRewardKey = 0;

      let start = this.user.loginIncentives - currentLoginDay.prevRewardKey;
      let end = nextRewardAt - currentLoginDay.prevRewardKey;
      return `${this.$t('checkinProgressTitle')} ${start}/${end}`;
    },
    getIncentivesProgress () {
      let currentLoginDay = Content.loginIncentives[this.user.loginIncentives];
      if (!currentLoginDay) return 0;
      let previousRewardDay = currentLoginDay.prevRewardKey;
      let nextRewardAt = currentLoginDay.nextRewardAt;
      return (this.user.loginIncentives - previousRewardDay) / (nextRewardAt - previousRewardDay) * 100;
    },
    save () {
      let values = {};

      each(this.editingProfile, (value, key) => {
        // Using toString because we need to compare two arrays (websites)
        let curVal = this.user.profile[key];
        if (!curVal || this.editingProfile[key].toString() !== curVal.toString()) values[`profile.${key}`] = value;
      });

      // @TODO: dispatch
      // User.set(values);

      this.editing = false;
    },
  },
};
</script>
