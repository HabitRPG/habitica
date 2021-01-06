<template>
  <b-modal
    id="welcome-modal"
    :ok-only="true"
    :ok-title="$t('gotIt')"
    :visible="!hideDialog"
    :hide-header="true"
    @hide="hideFlag()"
  >
    <div class="content">
      <div :class="npcClass('matt')"></div><h1
        v-once
        class="page-header"
      >
        {{ $t('welcomeStable') }}
      </h1><div
        v-once
        class="content-text"
      >
        {{ $t('welcomeStableText') }}
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/mixins.scss';

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
import { mapState } from '@/libs/store';
import seasonalNPC from '@/mixins/seasonalNPC';

export default {
  mixins: [seasonalNPC],
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
