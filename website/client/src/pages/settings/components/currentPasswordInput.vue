<template>
  <div class="input-area">
    <validated-text-input
      v-model="currentPassword"
      :settings-label="customLabel ?? 'password'"

      :placeholder="$t(customLabel ?? 'password')"
      :is-valid="isValid"
      :invalid-issues="invalidIssues"
      :only-show-invalid-state="true"
      input-type="password"
      @update:value="$emit('passwordValue', currentPassword)"
    >
      <div
        v-if="showForgetPassword"
        slot="top-right"
        class="forgot-password"
      >
        <router-link
          to="/forgot-password"
          target="_blank"
        >
          {{ $t('forgotPassword') }}
        </router-link>
      </div>
    </validated-text-input>
  </div>
</template>

<script>

import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';

export default {
  name: 'CurrentPasswordInput',
  components: { ValidatedTextInput },
  props: ['customLabel', 'showForgetPassword', 'isValid', 'invalidIssues'],
  data () {
    return {
      currentPassword: '',
    };
  },
};
</script>

<style lang="scss" scoped>
  .forgot-password {
    a {
      font-size: 12px;
      line-height: 1.33;
    }
  }
</style>
