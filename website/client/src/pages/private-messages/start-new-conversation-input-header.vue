<template>
  <div class="ml-4">
    <strong
      v-once
      v-html="$t('to')"
    ></strong>
    <input
      ref="targetUserInput"
      v-model="targetUserInputValue"
      class="mx-2"
      placeholder="@user"
      autofocus
      @keyup.enter="!preventTrigger && triggerNewConversation()"
    >

    <button
      class="btn btn-primary"
      :disabled="preventTrigger"
      @click="triggerNewConversation()"
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
  computed: {
    preventTrigger () {
      return !this.targetUserInputValue.includes('@')
        || this.targetUserInputValue.length < 2;
    },
  },
  mounted () {
    this.$refs.targetUserInput.focus();
  },
  methods: {
    triggerNewConversation () {
      this.$emit('startNewConversation', this.$refs.targetUserInput.value.replace('@', ''));
    },
  },
};
</script>
