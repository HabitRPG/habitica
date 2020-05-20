<template>
  <b-modal
    id="verify-username"
    class="d-flex"
    size="m"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    :hide-header="true"
    :hide-footer="true"
    @hide="$emit('hide')"
  >
    <div
      class="nametag-header"
      v-html="icons.helloNametag"
    ></div>
    <h2 class="text-center">
      {{ $t('usernameTime') }}
    </h2>
    <p
      class="text-center"
      v-html="$t('usernameInfo')"
    ></p>
    <username-form />
    <div class="scene_veteran_pets center-block"></div>
    <div class="small text-center mb-3">
      {{ $t('verifyUsernameVeteranPet') }}
    </div>
    <div
      class="small text-center tos-footer"
      v-html="$t('usernameTOSRequirements')"
    ></div>
  </b-modal>
</template>

<style lang="scss">
  #verify-username___BV_modal_outer_ {
    .modal-content {
      height: 100%;
      width: 566px;
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .center-block {
    margin: 0 auto 1em auto;
  }

  h2 {
    color: $purple-200;
    margin-top: 1.5rem;
  }

  .nametag-header {
    background-color: $gray-700;
    border-radius: 0.3rem 0.3rem 0rem 0rem;
    margin-left: -3rem;
    margin-right: -3rem;
    padding: 1rem 9rem 1rem 9rem;
  }

  p {
    color: $gray-100;
  }

  .small {
    color: $gray-200;
  }

  .tos-footer {
    background-color: $gray-700;
    border-radius: 0rem 0rem 0.3rem 0.3rem;
    margin-left: -3rem;
    margin-right: -3rem;
    margin-top: -0.1rem;
    padding: 1rem 4rem 1rem 4rem;
  }
</style>

<script>
import helloNametag from '@/assets/svg/hello-habitican.svg';
import usernameForm from './usernameForm';

export default {
  components: {
    usernameForm,
  },
  data () {
    return {
      icons: Object.freeze({
        helloNametag,
      }),
    };
  },
};
</script>
