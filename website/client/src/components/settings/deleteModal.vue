<template>
  <b-modal
    id="delete"
    :title="$t('deleteAccount')"
    :hide-footer="true"
    size="md"
  >
    <div class="modal-body">
      <br>
      <strong v-if="user.auth.local.has_password">{{ $t('deleteLocalAccountText') }}</strong>
      <strong
        v-if="!user.auth.local.has_password"
      >{{ $t('deleteSocialAccountText', {magicWord: 'DELETE'}) }}</strong>
      <div class="row mt-3">
        <div class="col-6">
          <input
            v-model="password"
            class="form-control"
            type="password"
          >
        </div>
      </div>
      <div class="row mt-3">
        <div
          id="feedback"
          class="col-12 form-group"
        >
          <label for="feedbackTextArea">{{ $t('feedback') }}</label>
          <textarea
            id="feedbackTextArea"
            v-model="feedback"
            class="form-control"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('neverMind') }}
      </button>
      <button
        class="btn btn-danger"
        :disabled="!password"
        @click="deleteAccount()"
      >
        {{ $t('deleteDo') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      password: '',
      feedback: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'delete');
    },
    async deleteAccount () {
      await axios.delete('/api/v4/user', {
        data: {
          password: this.password,
          feedback: this.feedback,
        },
      });
      localStorage.clear();
      window.location.href = '/static/home';
      this.$root.$emit('bv::hide::modal', 'delete');
    },
  },
};
</script>
