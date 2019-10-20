<template>
  <div class="container-fluid text-center">
    <div class="row">
      <div class="col-md-6 offset-3">
        <h1>{{ $t('clearBrowserData') }}</h1>
        <p v-html="$t('localStorageTryFirst', localStorageTryFirst) "></p>
        <br>
        <p class="text-center">
          <button
            class="btn btn-lg btn-danger"
            popover-trigger="mouseover"
            :popover="$t('localStorageClearExplanation')"
            @click="clearLocalStorage()"
          >
            {{ $t('localStorageClear') }}
          </button>
        </p>
        <br>
        <p v-html="$t('localStorageTryNext', localStorageTryNext) "></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      localStorageTryFirst: {
        linkStart: '<a href="/user/settings/site" target="_blank">',
        linkEnd: '</a>',
      },
      localStorageTryNext: {
        linkStart: '<a href="https://github.com/HabitRPG/habitica/issues/2760" target="_blank">',
        linkEnd: '</a>',
      },
    };
  },
  methods: {
    clearLocalStorage () {
      this.$store.dispatch('auth:logout');
    },
  },
};
</script>
