<template>
  <b-modal
    id="reset"
    :title="$t('resetAccount')"
    :hide-footer="true"
    size="md"
  >
    <p>{{ $t('resetText1') }}</p>
    <p>{{ $t('resetText2') }}</p>
    <div class="modal-footer">
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('neverMind') }}
      </button>
      <button
        class="btn btn-danger"
        @click="reset()"
      >
        {{ $t('resetDo') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'reset');
    },
    async reset () {
      await axios.post('/api/v4/user/reset');
      this.$router.push('/');
      setTimeout(() => window.location.reload(true), 100);
    },
  },
};
</script>
