<template lang="pug">
.text-center.delete-completed
  .help-text {{ $t('clearCompletedDescription') }}
  .btn.btn-danger(@click='clearTodos()') {{ $t('clearCompleted') }}
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
      if (!confirm(this.$t('clearCompletedConfirm'))) return;
      this.$store.dispatch('tasks:clearCompletedTodos');
    },
  },
};
</script>
