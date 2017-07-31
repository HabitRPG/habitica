<template lang="pug">
.standard-page
  .row
    .col-8
      .header
        h1 {{user.profile.name}}
        h4
          strong User Id:
          | {{user._id}}
    .col-4
      button.btn.btn-secondary(@click='editing = !editing') Edit
  .row(v-if='!editing')
    .col-8
      .about
        h2 About
        p {{user.profile.blurb}}
      .photo
        h2 Photo
        img.img-rendering-auto(v-if='user.profile.imageUrl', :src='user.profile.imageUrl')

    .col-4
      .info
        h2 info
        div
          strong Joined:
          | {{user.auth.timestamps.created}}
        div
          strong Total Log Ins:
          span {{ $t('totalCheckins', {count: user.loginIncentives}) }}
        div
          | {{getProgressDisplay()}}
          .progress
            .progress-bar(role='progressbar', :aria-valuenow='incentivesProgress', aria-valuemin='0', aria-valuemax='100', :style='{width: incentivesProgress + "%"}')
              span.sr-only {{ incentivesProgress }}% Complete
      // @TODO: Implement in V2 .social

  .row(v-if='editing')
    h1 Edit Profile
    .col-12
      .alert.alert-info.alert-sm(v-html='$t("communityGuidelinesWarning", managerEmail)')

      // TODO use photo-upload instead: https://groups.google.com/forum/?fromgroups=#!topic/derbyjs/xMmADvxBOak
      .form-group
        label {{ $t('displayName') }}
        input.form-control(type='text', :placeholder="$t('fullName')", v-model='editingProfile.name')
      .form-group
        label {{ $t('photoUrl') }}
        input.form-control(type='url', v-model='editingProfile.imageUrl', :placeholder="$t('imageUrl')")
      .form-group
        label {{ $t('about') }}
        textarea.form-control(rows=5, :placeholder="$t('displayBlurbPlaceholder')", v-model='editingProfile.blurb')
        // include ../../shared/formatting-help
      .form-group
        label Facebook
        input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.facebook')
      .form-group
        label Instagram
        input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.instagram')
      .form-group
        label Twitter
        input.form-control(type='text', placeholder="Paste your link here", v-model='editingProfile.twitter')

    .col-3.offset-6.text.center
      button.btn.btn-primary(@click='save()') {{ $t("save") }}
      button.btn.btn-warning(@click='editing = false') {{ $t("cancel") }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .header {
    h1 {
      color: #4f2a93;
    }

    h4 {
      color: #686274;
    }
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
