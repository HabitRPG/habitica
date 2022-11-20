<template>
  <div class="input-area">
    <div class="label-line">
      <div class="settings-label">
        {{ $t(customLabel ?? "password") }}
      </div>
      <div
        v-if="showForgetPassword"
        class="forgot-password"
      >
        <a
          class="edit-link"
          @click.prevent=""
        >
          {{ $t('forgotPassword') }} TODO
        </a>
      </div>
    </div>
    <div class="form-group">
      <div
        class="input-group"
      >
        <input
          v-model="currentPassword"
          class="form-control"
          :placeholder="$t(customLabel ?? 'password')"
          type="text"
          @keyup="$emit('passwordValue', currentPassword)"
        >
      </div>
    </div>
  </div>
</template>

<script>

// TODO change the authForm.vue to accept a query param so that it switches automically to
// "forgot password" mode

export default {
  name: 'CurrentPasswordInput',
  props: ['customLabel', 'showForgetPassword'],
  data () {
    return {
      currentPassword: '',
    };
  },
};
</script>

<style lang="scss" scoped>
  .label-line {
    display: flex;
  }

  .settings-label {
    flex: 1;
  }

  .forgot-password {
    a {
      font-size: 12px;
      line-height: 1.33;
    }
  }
</style>
