<template>
  <div
    v-if="!communityGuidelinesAccepted"
    class="row community-guidelines"
  >
    <div
      v-once
      class="col col-sm-12 col-xl-8"
      v-html="$t('communityGuidelinesIntro')"
    ></div>
    <div class="col-md-auto col-md-12 col-xl-4">
      <button
        v-once
        class="btn btn-secondary btn-follow-guidelines"
        @click="acceptCommunityGuidelines()"
      >
        {{ $t('acceptCommunityGuidelines') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

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
import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState({ user: 'user.data' }),
    communityGuidelinesAccepted () {
      return this.user.flags.communityGuidelinesAccepted;
    },
  },
  methods: {
    acceptCommunityGuidelines () {
      this.$store.dispatch('user:set', { 'flags.communityGuidelinesAccepted': true });
    },
  },
};
</script>
