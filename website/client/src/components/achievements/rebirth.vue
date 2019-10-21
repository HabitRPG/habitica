<template>
  <b-modal
    id="rebirth"
    :title="$t('modalAchievement')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <!-- @TODO: +achievementAvatar('sun',0)--><achievement-avatar class="avatar" />
      </div><div class="col-6 offset-3 text-center">
        <div v-if="user.achievements.rebirthLevel < 100">
          {{ $t('rebirthAchievement', {
            number: user.achievements.rebirths,
            level: user.achievements.rebirthLevel}) }}
        </div><div v-if="user.achievements.rebirthLevel >= 100">
          {{ $t('rebirthAchievement100', {number: user.achievements.rebirths}) }}
        </div><br><button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('huzzah') }}
        </button>
      </div>
    </div><achievement-footer />
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
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'rebirth');
    },
  },
};
</script>
