<template lang="pug">
ul.items(ng-if='user.stats.class && !user.preferences.disableClasses')
  li.task.reward-item.list-group-item(
    v-for='(skill, key) in spells[user.stats.class]',
    v-if='user.stats.lvl >= skill.lvl',
    popover-trigger='mouseenter',
    popover-placement='top',
    :popover='skillNotes(skill)')

    .task-meta-controls
      span.task-notes
        span.glyphicon.glyphicon-comment

    .task-controls.task-primary
      a.money.btn-buy.item-btn(@click='castStart(skill)', :class='{"disabled": spellDisabled(key)}')
        span.reward-cost
          strong {{skill.mana}}
          | {{ $t('mp') }}

    span(:class='`shop_${skill.key} shop-sprite item-img`').reward-img
    p.task-text {{skill.text()}}
</template>

<style scoped>
</style>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import spells from '../../../common/script/content/spells';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  data () {
    return {
      spells,
      applyingAction: false,
      spell: {},
    };
  },
  mounted () {
    this.$root.$on('castEnd', (msg) => {
      console.log(msg)
    });
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    spellDisabled (skill) {
      if (skill === 'frost' && this.user.stats.buffs.streaks) {
        return true;
      }
      // @TODO: Implement
      // } else if (skill === 'stealth' && this.user.stats.buffs.stealth >= this.user.dailys.length) {
      //   return true;
      // }

      return false;
    },
    skillNotes (skill) {
      let notes = skill.notes();

      if (skill.key === 'frost' && this.spellDisabled(skill.key)) {
        notes = this.$t('spellWizardFrostAlreadyCast');
      } else if (skill.key === 'stealth' && this.spellDisabled(skill.key)) {
        notes = this.$t('spellRogueStealthMaxedOut');
      } else if (skill.key === 'stealth') {
        notes = this.$t('spellRogueStealthDaliesAvoided', {
          originalText: notes,
          number: this.user.stats.buffs.stealth,
        });
      }

      return notes;
    },
    castStart (spell) {
      if (this.user.stats.mp < spell.mana) return this.text(this.$t('notEnoughMana'));

      if (spell.immediateUse && this.user.stats.gp < spell.value) {
        return this.text('Not enough gold.');
      }

      this.applyingAction = true;
      this.spell = spell;
      document.querySelector("body").style.cursor = 'crosshair';

      if (spell.target === 'self') {
        this.castEnd(null, 'self');
      } else if (spell.target === 'party') {
        // Groups.party()
        //   .then(function (party) {
        //     party = (_.isArray(party) ? party : []).concat(this.user);
        //     this.castEnd(party, 'party');
        //   })
        //   .catch(function (party) { // not in a party, act as a solo party
        //     if (party && party.type === 'party') {
        //       party = [this.user];
        //       this.castEnd(party, 'party');
        //     }
        //   });
      } else if (spell.target === 'tasks') {
        // let tasks = this.user.habits.concat(this.user.dailys).concat(this.user.rewards).concat(this.user.todos);
        // // exclude challenge tasks
        // tasks = tasks.filter(function (task) {
        //   if (!task.challenge) return true;
        //   return (!task.challenge.id || task.challenge.broken);
        // });
        // this.castEnd(tasks, 'tasks');
      }
    },
    async castEnd (target, type, $event) {
      let beforeQuestProgress = this.questProgress();

      if (!this.applyingAction) return 'No applying action';
      $event && ($event.stopPropagation(), $event.preventDefault());

      if (this.spell.target !== type) return this.text(this.$t('invalidTarget'));
      this.spell.cast(this.user, target);
      // User.save(); // @TODO:

      let spell = this.spell;
      let targetId = target ? target._id : null;
      this.spell = null;
      this.applyingAction = false;

      let spellUrl = `/api/v3/user/class/cast/${spell.key}`;
      if (targetId) spellUrl += `?targetId=${targetId}`;

      await axios.post(spellUrl);
      let msg = this.$t('youCast', {
        spell: spell.text(),
      });

      switch (type) {
        case 'task':
          msg = this.$t('youCastTarget', {
            spell: spell.text(),
            target: target.text,
          });
          break;
        case 'user':
          msg = this.$t('youCastTarget', {
            spell: spell.text(),
            target: target.profile.name,
          });
          break;
        case 'party':
          msg = this.$t('youCastParty', {
            spell: spell.text(),
          });
          break;
      }

      this.markdown(msg); // @TODO: mardown directive?
      // @TODO:
      // let questProgress = this.questProgress() - beforeQuestProgress;
      // if (questProgress > 0) {
      //   let userQuest = Content.quests[user.party.quest.key];
      //   if (userQuest.boss) {
      //     Notification.quest('questDamage', questProgress.toFixed(1));
      //   } else if (quest.collection && userQuest.collect) {
      //     Notification.quest('questCollection', questProgress);
      //   }
      // }
      // User.sync();
    },
    castCancel () {
      this.applyingAction = false;
      this.spell = null;
    },
    questProgress () {
      let user = this.user;
      // if (user.party.quest) {
      //   let userQuest = Content.quests[user.party.quest.key];
      //
      //   if (!userQuest) {
      //     return 0;
      //   }
      //   if (userQuest.boss && user.party.quest.progress.up > 0) {
      //     return user.party.quest.progress.up;
      //   }
      //   if (userQuest.collect && user.party.quest.progress.collectedItems > 0) {
      //     return user.party.quest.progress.collectedItems;
      //   }
      // }
      return 0;
    },
  },
};
</script>
