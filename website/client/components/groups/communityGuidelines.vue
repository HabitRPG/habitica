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
  padding: 1em;
  color: $white;
  position: absolute;
  top: 0;
  height: 150px;
  margin-top: 2.3em;
  width: 100%;
  border-radius: 4px;
  align-items: center;
  justify-content: center;

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
