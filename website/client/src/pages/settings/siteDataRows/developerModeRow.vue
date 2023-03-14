<template>
  <tr>
    <td class="settings-label">
      {{ $t("developerMode") }}
    </td>
    <td class="settings-value">
      Todo
    </td>
    <td class="settings-button">
    </td>
  </tr>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

</style>

<script>
import { mapState } from '@/libs/store';

export default {
  mixins: [],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {

  },
};
</script>
