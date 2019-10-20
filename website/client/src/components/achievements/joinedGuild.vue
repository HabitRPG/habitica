<template>
  <b-modal
    id="joined-guild"
    :title="$t('modalAchievement')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <!-- @TODO: +achievementAvatar('guild',0)-->
        <achievement-avatar class="avatar" />
      </div>
      <div class="col-6 offset-3 text-center">
        <p>{{ $t('joinedGuildText') }}</p>
        <br>
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

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'joined-guild');
    },
  },
};
</script>
