<template>
  <div class="row">
    <secondary-menu class="col-12">
      <router-link
        class="nav-link"
        :to="{name: 'market'}"
        exact="exact"
      >
        {{ $t('market') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'quests'}"
      >
        {{ $t('quests') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'seasonal'}"
      >
        {{ $t('titleSeasonalShop') }}
      </router-link>
      <router-link
        class="nav-link"
        :to="{name: 'time'}"
      >
        {{ $t('titleTimeTravelers') }}
      </router-link>
    </secondary-menu>
    <div class="col-12">
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
  methods: {},
};
</script>
