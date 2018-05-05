<template lang="pug">
  b-modal#ultimate-gear(:title="$t('modalAchievement')", size='md', :hide-footer="true")
    .modal-body
      .col-12
        // @TODO: +achievementAvatar('armor',2.5)
        achievement-avatar.avatar
      .col-12.text-center
        p {{ $t('gearAchievement') }}
        br
        table.multi-achievement
          tr
            td(v-if='user.achievements.ultimateGearSets.healer').multi-achievement
              .achievement-ultimate-healer2x.multi-achievement
              | {{ $t('healer') }}
            td(v-if='user.achievements.ultimateGearSets.wizard').multi-achievement
              .achievement-ultimate-mage2x.multi-achievement
              | {{ $t('mage') }}
            td(v-if='user.achievements.ultimateGearSets.rogue').multi-achievement
              .achievement-ultimate-rogue2x.multi-achievement
              | {{ $t('rogue') }}
            td(v-if='user.achievements.ultimateGearSets.warrior').multi-achievement
              .achievement-ultimate-warrior2x.multi-achievement
              | {{ $t('warrior') }}
        br
        div(v-if='!(user.achievements.ultimateGearSets.healer && user.achievements.ultimateGearSets.wizard && user.achievements.ultimateGearSets.rogue && user.achievements.ultimateGearSets.warrior)')
          p(v-html="$t('moreGearAchievements')")
          br
        .shop_armoire
        p(v-html='$t("armoireUnlocked")')
        br
        button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    achievement-footer
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
import { mapState } from 'client/libs/store';

export default {
  components: {
    achievementFooter,
    achievementAvatar,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'ultimate-gear');
    },
  },
};
</script>
