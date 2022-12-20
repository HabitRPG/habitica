<template>
  <div class="your-balance">
    <span
      v-once
      class="label"
    >
      {{ $t('yourBalance') }}:
    </span>

    <balance-info class="balance-info" />
  </div>
</template>

<script>
import BalanceInfo from '@/components/shops/balanceInfo.vue';

export default {
  name: 'YourBalance',
  components: { BalanceInfo },
};
</script>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

.your-balance {
  padding: 8px 16px;
  border-radius: 4px;
  background-color: $gray-600;
  display: inline-block;
align-self: center;
}

.label {
  font-size: 12px;
  font-weight: bold;
  line-height: 1.33;
  color: $gray-100;
}

.balance-info {
  display: inline-block !important;
}
</style>
