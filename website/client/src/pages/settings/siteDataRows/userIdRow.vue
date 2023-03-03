<template>
  <tr>
    <td class="settings-label">
      {{ $t("userId") }}
    </td>
    <td class="settings-value">
      {{ user.id }}
    </td>
    <td class="settings-button">
      <a
        class="edit-link"
        @click.prevent="copyUserId()"
      >
        {{ $t('copy') }}
      </a>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

</style>

<script>
import { mapState } from '@/libs/store';
import copyToClipboard from '@/mixins/copyToClipboard';

export default {
  mixins: [copyToClipboard],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    copyUserId () {
      this.mixinCopyToClipboard(
        this.user.id,
        this.$t('useridCopied'),
      );
    },
  },
};
</script>
