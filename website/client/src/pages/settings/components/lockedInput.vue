<template>
  <div class="input-area">
    <div class="label-line">
      <div class="settings-label">
        {{ label }}
      </div>
      <div
        class="link-style"
        @click="mixinCopyToClipboard(value, notificationText)"
      >
        {{ $t('copy') }}
      </div>
    </div>
    <div class="form-group">
      <div
        class="input-group"
      >
        <div class="input-group-prepend input-group-icon">
          <div
            v-once
            class="svg-icon icon-16"
            v-html="icons.lock"
          ></div>
        </div>
        <input
          :value="value"
          class="form-control"
          readonly
          aria-readonly="true"
          type="text"
        >
      </div>
    </div>
  </div>
</template>

<script>

import CopyToClipboard from '@/mixins/copyToClipboard';
import svgLockSmall from '@/assets/svg/lock-small.svg';

export default {
  name: 'LockedInput',
  mixins: [CopyToClipboard],
  props: ['label', 'value', 'notificationText'],
  data () {
    return {
      icons: Object.freeze({
        lock: svgLockSmall,
      }),
    };
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.label-line {
  display: flex;
}

.settings-label {
  flex: 1;
}

.link-style {
  font-size: 12px;
  line-height: 1.33;
  color: $purple-300;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover, &:active, &:focus {
    text-decoration: underline;
  }
}

.input-group {
  border-radius: 2px;

  input {
    border: solid 1px $gray-500;
    background-color: $gray-700;

    &:hover {
      outline: 0;
    }
  }
}

.input-group-icon {
  padding: 8px;

  border-radius: 2px;

  background-color: $gray-600;
}
</style>
