<template>
  <b-modal
    id="select-user-modal"
    size="sm"
    :hide-header="true"
    :hide-footer="true"
  >
    <p>Who would you like to send a gift to?</p>
    <div
      class="form"
      name="selectUser"
      novalidate="novalidate"
    >
      <div class="form-group">
        <input
          id="selectUser"
          v-model="userSearchTerm"
          class="form-control"
          type="text"
          :placeholder="'Username or UUID'"
          :class="{'is-invalid input-invalid': userNotFound}"
        >
        <div
          v-if="userSearchTerm.length > 0 && userNotFound"
          class="input-error"
        >
          Username or UUID not found.
        </div>
      </div>
      <button
        class="btn btn-primary"
        type="submit"
        :disabled="searchCannotSubmit"
        @click="selectUser(userSearchTerm)"
      >
        Send Gift
      </button>
    </div>
  </b-modal>
</template>

<script>
import debounce from 'lodash/debounce';

export default {
  data () {
    return {
      userNotFound: false,
      userSearchTerm: '',
      foundUser: {},
    };
  },
  computed: {
    searchCannotSubmit () {
      if (this.userSearchTerm.length < 1) return true;
      return this.userNotFound;
    },
  },
  watch: {
    userSearchTerm: {
      handler () {
        this.searchUser(this.userSearchTerm);
      },
    },
  },
  methods: {
    searchUser: debounce(function userSearch (searchTerm) {
      if (searchTerm.length < 1) {
        this.userNotFound = false;
        return;
      }
      this.$store.dispatch('hall:getHero', {
        uuid: searchTerm,
      }).then(res => {
        this.foundUser = res.data;
        this.userNotFound = false;
      }).catch(() => {
        this.foundUser = {};
        this.userNotFound = true;
      });
    }, 500),
  },
};
</script>
