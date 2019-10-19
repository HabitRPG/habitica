<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'items'}"
        exact="exact"
      >
        {{ $t('items') }}
      </router-link><router-link
        class="nav-link"
        :to="{name: 'equipment'}"
      >
        {{ $t('equipment') }}
      </router-link><router-link
        class="nav-link"
        :to="{name: 'stable'}"
      >
        {{ $t('stable') }}
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
