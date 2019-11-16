<template>
  <b-modal
    id="ultimate-gear"
    :title="$t('modalAchievement')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <!-- @TODO: +achievementAvatar('armor',2.5)-->
        <achievement-avatar class="avatar" />
      </div>
      <div class="col-12 text-center">
        <p>{{ $t('gearAchievement') }}</p>
        <br>
        <table class="multi-achievement">
          <tr>
            <td
              v-if="user.achievements.ultimateGearSets.healer"
              class="multi-achievement"
            >
              <div class="achievement-ultimate-healer2x multi-achievement"></div>
              {{ $t('healer') }}
            </td>
            <td
              v-if="user.achievements.ultimateGearSets.wizard"
              class="multi-achievement"
            >
              <div class="achievement-ultimate-mage2x multi-achievement"></div>
              {{ $t('mage') }}
            </td>
            <td
              v-if="user.achievements.ultimateGearSets.rogue"
              class="multi-achievement"
            >
              <div class="achievement-ultimate-rogue2x multi-achievement"></div>
              {{ $t('rogue') }}
            </td>
            <td
              v-if="user.achievements.ultimateGearSets.warrior"
              class="multi-achievement"
            >
              <div class="achievement-ultimate-warrior2x multi-achievement"></div>
              {{ $t('warrior') }}
            </td>
          </tr>
        </table>
        <br>
        <div
          v-if="!user.achievements.ultimateGearSets.healer
            && user.achievements.ultimateGearSets.wizard
            && user.achievements.ultimateGearSets.rogue
            && user.achievements.ultimateGearSets.warrior"
        >
          <p v-html="$t('moreGearAchievements')"></p>
          <br>
        </div>
        <div class="shop_armoire"></div>
        <p v-html="$t('armoireUnlocked')"></p>
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
  .shop_armoire {
    margin: 0 auto;
  }

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
      this.$root.$emit('bv::hide::modal', 'ultimate-gear');
    },
  },
};
</script>
