<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
    .modal-body.text-center
      h3(style='margin-bottom:0') {{ $t('modalAchievement') }}
      // @TODO: +achievementAvatar('armor',2.5)
      p {{ $t('gearAchievement') }}
      br
      table.multi-achievement
        tr
          td(ng-if='::user.achievements.ultimateGearSets.healer').multi-achievement
            .achievement-ultimate-healer2x.multi-achievement
            | {{ $t('healer') }}
          td(ng-if='::user.achievements.ultimateGearSets.wizard').multi-achievement
            .achievement-ultimate-mage2x.multi-achievement
            | {{ $t('mage') }}
          td(ng-if='::user.achievements.ultimateGearSets.rogue').multi-achievement
            .achievement-ultimate-rogue2x.multi-achievement
            | {{ $t('rogue') }}
          td(ng-if='::user.achievements.ultimateGearSets.warrior').multi-achievement
            .achievement-ultimate-warrior2x.multi-achievement
            | {{ $t('warrior') }}
      br
      div(ng-if='!(user.achievements.ultimateGearSets.healer && user.achievements.ultimateGearSets.wizard && user.achievements.ultimateGearSets.rogue && user.achievements.ultimateGearSets.warrior)')
        p {{ $t('moreGearAchievements') }}
        br
      .shop_armoire.pull-right
      p {{ $t("armoireUnlocked") }}
      br
      button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    // @TODO: +achievementFooter
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'testing');
    },
  },
};
</script>
