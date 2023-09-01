<template>
  <b-modal
    id="profile"
    :hide-footer="true"
    @hide="beforeHide"
    @shown="onShown()"
  >
    <div slot="modal-header">
      <close-x
        @close="close()"
      />
    </div>

    <profile
      :user-id="userId"
      :starting-page="startingPage"
      style="margin-top:24px;"
    />
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #profile {
    .modal-dialog {
      max-width: 684px;
    }
    .modal-body {
      padding: 0;
      border-radius: 12px;
      background-color: $white;
    }
    .modal-content {
      background: $gray-700;
      padding: 0;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .header {
    width: 100%;
  }

</style>

<script>
import profile from './profile';
import closeX from '../ui/closeX';

export default {
  components: {
    profile,
    closeX,
  },
  data () {
    return {
      userId: undefined,
      startingPage: undefined,
      path: undefined,
    };
  },
  mounted () {
    this.$root.$on('habitica:show-profile', data => {
      this.userId = data.userId;
      this.startingPage = data.startingPage || 'profile';
      this.path = data.path;
      this.$root.$emit('bv::show::modal', 'profile');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:show-profile');
  },
  methods: {
    onShown () {
      window.history.pushState('', null, this.path);
    },
    beforeHide () {
      if (this.$route.path !== window.location.pathname) {
        this.$router.back();
      }
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'profile');
    },
  },
};


</script>
