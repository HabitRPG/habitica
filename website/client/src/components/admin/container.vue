<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'adminPanel'}"
      >
        {{ $t('adminPanel') }}
      </router-link><router-link
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
import SecondaryMenu from '@/components/secondaryMenu';

export default {
  components: {
    SecondaryMenu,
  },
};
</script>
