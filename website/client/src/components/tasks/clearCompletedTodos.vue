<template>
  <div class="text-center delete-completed">
    <div class="help-text">
      {{ $t('clearCompletedDescription') }}
    </div>
    <div
      class="btn btn-danger"
      @click="clearTodos()"
    >
      {{ $t('clearCompleted') }}
    </div>
  </div>
</template>

<style lang="scss">
.delete-completed {
  padding: 1em;

  .help-text {
    color: #878190;
    font-size: 12px;
  }

  .btn-danger {
    font-size: 12px;
    padding: .4em .6em;
    margin-top: .5em;
  }
}
</style>

<script>
export default {
  methods: {
    clearTodos () {
      if (!window.confirm(this.$t('clearCompletedConfirm'))) return; // eslint-disable-line no-alert
      this.$store.dispatch('tasks:clearCompletedTodos');
    },
  },
};
</script>
