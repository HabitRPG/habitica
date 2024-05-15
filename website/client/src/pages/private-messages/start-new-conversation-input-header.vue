<template>
  <div>
    To:
    <input
      ref="targetUserInput"
      value="target user"
    >

    <button
      class="btn btn-primary"
      @click="$emit('startNewConversation', $refs.targetUserInput.value)"
    >
      Confirm
    </button>

    <button
      class="btn-secondary"
      @click="$emit('cancelNewConversation')"
    >
      Cancel
    </button>
  </div>
</template>

<style scoped lang="scss">

</style>

<script>

</script>
