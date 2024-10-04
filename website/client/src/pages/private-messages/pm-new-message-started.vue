<template>
  <div
    v-once
    class="centered empty-messages m-auto text-center"
  >
    <avatar
      v-if="memberObj"
      :member="memberObj"
      :avatar-only="true"
      :show-weapon="false"
      :hide-class-badge="true"
      :override-top-padding="'0px'"
      :sprites-margin="'0 0 0 -30px'"
      :debug-mode="false"
      :center-avatar="true"
      class="mb-3"
    />

    <strong>{{ memberObj.profile.name }}</strong>
    <div class="username mb-3">
      @{{ memberObj.auth.local.username }}
    </div>

    <div
      class="kind-text"
      v-html="$t('rememberToBeKind')"
    ></div>
  </div>
</template>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .centered {
    align-content: center;
  }

  .center-avatar {
    margin: 0 auto;
  }

  strong {
    line-height: 1.71;
  }

  .username {
    font-size: 12px;
    line-height: 1.33;
    color: $gray-100;
    margin-top: -4px;
  }

  .kind-text {
    width: 330px;
    line-height: 1.71;
    color: $gray-100;
  }
</style>

<script>
import Avatar from '@/components/avatar.vue';

export default {
  components: { Avatar },
  props: {
    memberObj: null,
  },
};
</script>
