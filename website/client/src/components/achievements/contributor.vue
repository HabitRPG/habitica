<template>
  <b-modal
    id="contributor"
    :title="$t('modalContribAchievement')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <achievement-avatar class="avatar" />
      </div>
      <div class="col-6 offset-3 text-center">
        {{ $t('contribModal', {name: user.profile.name, level: user.contributor.level}) }}
        <br>
        <a
          :href="$t('conRewardsURL')"
          target="_blank"
        >{{ $t('contribLink') }}</a>
        <br>
        <button
          class="btn btn-primary"
          style="margin-top:1em"
          @click="close()"
        >
          {{ $t('huzzah') }}
        </button>
        <br>
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
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'contributor');
    },
  },
};
</script>
