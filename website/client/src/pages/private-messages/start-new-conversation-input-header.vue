<template>
  <div class="ml-4">
    <strong
      v-once
      v-html="$t('to')"
    ></strong>
    <validated-text-input
      id="selectUser"
      ref="targetUserInput"
      v-model="targetUserInputValue"
      class="mx-2"
      :is-valid="foundUser._id"
      :only-show-invalid-state="foundUser._id === undefined"

      :hide-error-line="true"
      :placeholder="$t('usernameOrUserId')"
      :invalid-issues="userInputInvalidIssues"
      @enter="triggerNewConversation"
    />

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
@import '@/assets/scss/colors.scss';

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

#selectUser {
  /* changing the style of validate-text-input to the same as others */
  ::v-deep {
    .input-group {
      border-width: 2px;

      input {
        width: 420px;
        height: 100%;
        color: $gray-50;
      }
    }

    .input-group {
      &:focus, &:active, &:focus-within {
        border: solid 2px $purple-400;
      }
    }
  }
}

</style>

<script>

import debounce from 'lodash/debounce';
import isUUID from 'validator/es/lib/isUUID';
import ValidatedTextInput from '@/components/ui/validatedTextInput.vue';

export default {
  components: {
    ValidatedTextInput,
  },
  mixins: [],
  data () {
    return {
      targetUserInputValue: '',
      userNotFound: false,
      foundUser: {},
    };
  },
  computed: {
    preventTrigger () {
      return this.targetUserInputValue.length < 2;
    },
    userInputInvalidIssues () {
      return this.targetUserInputValue.length > 0 && this.userNotFound
        ? [this.$t('userWithUsernameOrUserIdNotFound')]
        : [''];
    },
  },
  watch: {
    targetUserInputValue: {
      handler () {
        this.searchUser(this.targetUserInputValue.replace('@', ''));
      },
    },
  },
  mounted () {
    this.$refs.targetUserInput.focus();
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'select-user-modal');
    },
    searchUser: debounce(async function userSearch (searchTerm = '') {
      this.foundUser = {};
      if (searchTerm.length < 1) {
        this.userNotFound = false;
        return;
      }
      let result;
      if (isUUID(searchTerm)) {
        try {
          result = await this.$store.dispatch('members:fetchMember', {
            memberId: searchTerm,
          });
        } catch {
          result = null;
        }
      } else {
        try {
          result = await this.$store.dispatch('members:fetchMemberByUsername', {
            username: searchTerm,
          });
        } catch {
          result = null;
        }
      }
      if (!result) {
        this.userNotFound = true;
        return;
      }
      this.userNotFound = false;
      this.foundUser = result;
    }, 500),
    triggerNewConversation () {
      const userWithoutAt = this.$refs.targetUserInput.value.replace('@', '');

      this.$emit('startNewConversation', userWithoutAt);
    },
  },
};
</script>
