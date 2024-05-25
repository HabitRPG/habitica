<template>
  <div class="ml-4">
    <strong
      v-once
      v-html="$t('to')"
    ></strong>
    <input
      ref="targetUserInput"
      class="mx-2"
      :value="targetUserInputValue"
    >

    <button
      class="btn btn-primary"
      @click="$emit('startNewConversation', $refs.targetUserInput.value)"
    >
      {{ $t('confirm') }}
    </button>

    <button
      class="ml-2 btn btn-secondary"
      @click="$emit('cancelNewConversation')"
    >
      {{ $t('cancel') }}
    </button>
  </div>
</template>

<style scoped lang="scss">
div {
  display: flex;
  align-items: center;
}

div > * {
  height: 32px;
}

strong {
  line-height: 1.71;
  align-content: center;
}

input {
  border-radius: 2px;
  border-width: 2px;

  width: 420px;
}
</style>

<script>

export default {
  components: {
  },
  mixins: [],
  data () {
    return {
      targetUserInputValue: '',
    };
  },
};
</script>
