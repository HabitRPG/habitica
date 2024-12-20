<template>
  <div class="d-flex align-items-center justify-content-between py-3 px-4">
    <p
      class="mr-3 mb-0"
      v-html="$t('privacyOverview')"
    >
    </p>
    <div class="d-flex flex-column justify-content-around text-center ml-3">
      <button class="btn btn-primary mb-2">
        {{ $t('acceptAllCookies') }}
      </button>
      <button class="btn btn-secondary mb-2">
        {{ $t('denyNonEssentialCookies') }}
      </button>
      <a>{{ $t('managePrivacyPreferences') }}</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  button {
    min-width: 40px;
    width: 558px;
  }

  a, p {
    line-height: 1.714;
  }
</style>

<script>

</script>
