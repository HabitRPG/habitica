<template>
  <b-modal
    id="lost-masterclasser"
    :title="title"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <achievement-avatar class="avatar" />
      </div>
      <div class="col-6 offset-3 text-center">
        <p>{{ $t('achievementLostMasterclasserModalText') }}</p>
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('huzzah') }}
        </button>
      </div>
    </div>
    <achievement-footer />
  </b-modal>
</template>

<style scoped>
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import achievementFooter from './achievementFooter';
import achievementAvatar from './achievementAvatar';

import { mapState } from '@/libs/store';

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  data () {
    return {
      title: `${this.$t('modalAchievement')} ${this.$t('achievementLostMasterclasser')}`,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'lost-masterclasser');
    },
  },
};
</script>
