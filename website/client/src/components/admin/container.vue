<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        v-if="user.permissions.fullAccess || user.permissions.userSupport"
        class="nav-link"
        :to="{name: 'adminPanel'}"
      >
        {{ $t('adminPanel') }}
      </router-link>
      <router-link
        v-if="user.permissions.fullAccess || user.permissions.accessControl"
        class="nav-link"
        :to="{name: 'blockers'}"
      >
        {{ $t('siteBlockers') }}
      </router-link>
    </secondary-menu><div class="col-12">
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from '@/libs/store';
import SecondaryMenu from '@/components/secondaryMenu';

export default {
  components: {
    SecondaryMenu,
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
};
</script>
