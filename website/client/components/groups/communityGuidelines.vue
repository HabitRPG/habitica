<template lang="pug">
.row.community-guidelines(v-if='!communityGuidelinesAccepted')
  div.col.col-sm-12.col-xl-8(v-once, v-html="$t('communityGuidelinesIntro')")

  div.col-md-auto.col-md-12.col-xl-4
    button.btn.btn-info.btn-follow-guidelines(@click='acceptCommunityGuidelines()', v-once) {{ $t('acceptCommunityGuidelines') }}
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.community-guidelines {
  background-color: rgba(135, 129, 144, 0.84);
  padding-left: 0;
  padding-right: 0;
  color: $white;
  width: 100%;
  // width: calc(100% - 24px);
  border-radius: 4px;
  align-items: center;
  justify-content: center;

  .col {
    padding: 20px 24px;
  }

  a {
    text-decoration: underline;
    color: $white;
    font-weight: bold;
  }

  button {
    margin: 20px 12px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .btn-follow-guidelines {
    white-space: pre-line;
  }
}
</style>

<script>
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({user: 'user.data'}),
    communityGuidelinesAccepted () {
      return this.user.flags.communityGuidelinesAccepted;
    },
  },
  methods: {
    acceptCommunityGuidelines () {
      this.$store.dispatch('user:set', {'flags.communityGuidelinesAccepted': true});
    },
  },
};
</script>
