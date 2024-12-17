<template>
  <div class="d-flex align-items-center justify-content-between py-3 px-4">
    <div
      class="mr-3"
      v-html="$t('privacyOverview')"
    >
    </div>
    <div class="d-flex flex-column justify-content-around text-center ml-3">
      <button class="btn btn-primary mb-2">
        Accept All Cookies
      </button>
      <button class="btn btn-secondary mb-2">
        Deny Non-Essential Cookies
      </button>
      <a>Manage Your Privacy Preferences</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  button {
    min-width: 40px;
    width: 558px;
  }
</style>

<script>

</script>
