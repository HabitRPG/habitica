<template>
  <tr>
    <td class="settings-label">
      <div
        v-once
        class="d-flex align-items-center"
      >
        {{ $t("userId") }} <information-icon
          tooltip-id="userId"
          :tooltip="$t('userIdTooltip')"
        />
      </div>
    </td>
    <td
      v-once
      class="settings-value"
    >
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
import InformationIcon from '@/components/ui/informationIcon.vue';

export default {
  components: { InformationIcon },
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
