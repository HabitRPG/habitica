<template lang="pug">
b-modal#welcome-modal(:ok-only="true",
  :ok-title="$t('gotIt')",
  :visible="!hideDialog",
  :hide-header="true",
  @hide="hideFlag()")
  div.content
    div.npc_matt
    h1.page-header(v-once) {{ $t('welcomeStable') }}
    div.content-text(v-once) {{ $t('welcomeStableText') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/modal.scss';

  #welcome-modal {
    @include centeredModal();

    .npc_matt {
      margin: 0 auto 21px auto;
    }

    .content {
      text-align: center;

      // the modal already has 15px padding
      margin-left: 33px;
      margin-right: 33px;
      margin-top: 25px;
    }

    .content-text {
      font-size: 14px;
      font-weight: normal;
      line-height: 1.43;

      width: 400px;
    }

    .modal-footer {
      justify-content: center;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';

export default {
  computed: {
    ...mapState({
      hideDialog: 'user.data.flags.tutorial.common.mounts',
    }),
  },
  methods: {
    hideFlag () {
      this.$store.dispatch('user:set', {
        'flags.tutorial.common.mounts': true,
      });
    },
  },
};
</script>
