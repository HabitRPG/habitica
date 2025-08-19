<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        v-if="hasPermission(user, 'userSupport')"
        class="nav-link"
        :to="{name: 'adminPanel'}"
      >
        {{ $t('adminPanel') }}
      </router-link>
      <router-link
        v-if="hasPermission(user, 'groupSupport')"
        class="nav-link"
        :to="{name: 'groupAdmin'}"
      >
        {{ $t('groupAdmin') }}
      </router-link>
      <router-link
        v-if="hasPermission(user, 'accessControl')"
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
import { userStateMixin } from '../../mixins/userState';

export default {
  components: {
    SecondaryMenu,
  },
  mixins: [
    userStateMixin,
  ],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
};
</script>
