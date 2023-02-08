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
        <router-link
          to="/forgot-password"
          target="_blank"
        >
          {{ $t('forgotPassword') }}
        </router-link>
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
          type="password"
          @keyup="$emit('passwordValue', currentPassword)"
        >
      </div>
    </div>
  </div>
</template>

<script>

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
