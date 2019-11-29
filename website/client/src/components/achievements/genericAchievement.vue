<template>
  <b-modal
    id="generic-achievement"
    :title="data.message"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <div
          class="icon"
          :class="achievementClass"
        ></div>
      </div>
      <div class="col-6 offset-3 text-center">
        <strong v-html="$t(achievement.titleKey)"></strong>
        <p v-html="$t(achievement.textKey)"></p>
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

<style scoped lang="scss">
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }

  .icon {
    margin: 0 auto;
  }
</style>

<script>
import achievementFooter from './achievementFooter';

import { mapState } from '@/libs/store';
import achievements from '@/../../common/script/content/achievements';

export default {
  components: {
    achievementFooter,
  },
  props: ['data'],
  computed: {
    ...mapState({ user: 'user.data' }),
    achievement () {
      return achievements[this.data.achievement];
    },
    achievementClass () {
      return `${this.achievement.icon}2x`;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'generic-achievement');
    },
  },
};
</script>
