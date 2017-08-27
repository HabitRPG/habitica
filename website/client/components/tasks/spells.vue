<template lang="pug">
div(v-if='user.stats.lvl > 10')
  div.dragInfo.mouse(ref="clickPotionInfo", v-if="potionClickMode")
    .spell.col-12.row
      .col-8.details
        p.title {{spell.text()}}
        p.notes {{ `Click on a ${spell.target} to cast!`}}
        // @TODO make that translatable
      .col-4.mana
        .img(:class='`shop_${spell.key} shop-sprite item-img`')

  drawer(:title="$t('spells')",
    v-if='user.stats.class && !user.preferences.disableClasses',
    v-mousePosition="30", @mouseMoved="mouseMoved($event)",
    :openStatus='openStatus',
    v-on:toggled='drawerToggled')
    div(slot="drawer-slider")
      .container.spell-container
        .row
          .col-3(
            @click='castStart(skill)',
            v-for='(skill, key) in spells[user.stats.class]',
            v-if='user.stats.lvl >= skill.lvl',
            popover-trigger='mouseenter',
            popover-placement='top',
            :popover='skillNotes(skill)')
            .spell.col-12.row
              .col-8.details
                a(:class='{"disabled": spellDisabled(key)}')
                p.title {{skill.text()}}
                p.notes {{skill.notes()}}
              .col-4.mana
                .img(:class='`shop_${skill.key} shop-sprite item-img`')
                .mana-text
                  .svg-icon(v-html="icons.mana")
                  div {{skill.mana}}
</template>

<style lang="scss" scoped>
  .drawer-container {
    left: 19%;
  }

  .drawer-slider {
    margin-top: 1em;
  }

  .spell-container {
    margin-top: .5em;
    white-space: initial;
  }

  .spell:hover {
    cursor: pointer;
  }

  .spell {
    background: #ffffff;
    margin-bottom: 1em;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    border-radius: 2px;
    color: #4e4a57;
    padding-right: 0;
    padding-left: 0;

    .details {
      text-align: left;
      padding-top: .5em;

      p {
        margin-bottom: .5em;
      }

      .notes {
        font-weight: normal;
        color: #686274;
      }
    }

    .img {
      margin: 0 auto;
    }

    .mana-text {
      margin-bottom: .2em;

      div {
        display: inline-block;
        vertical-align: bottom;
      }

      .svg-icon {
        width: 16px;
        margin-right: .2em;
      }
    }

    .mana {
      padding: .2em;
      background-color: rgba(70, 167, 217, 0.24);
      color: #2995cd;
      font-weight: bold;
      text-align: center;
    }
  }

  .dragInfo {
    position: absolute;
    left: -500px;
    z-index: 1080;

    .spell {
      border-radius: 1000px;
      min-width: 224px;
      height: 52px;
      font-size: 12px;
      padding-left: .5em;

      .title {
        font-weight: bold;
      }
    }

    .mana {
      border-radius: 0 1000px 1000px 0;
    }

    &.mouse {
      position: fixed;
      pointer-events: none
    }
    .potion-icon {
      margin: 0 auto;
    }
    .popover {
      position: inherit;
      width: 100px;
    }
  }
</style>

<script>
import axios from 'axios';
import isArray from 'lodash/isArray';

import spells from '../../../common/script/content/spells';
import { crit } from '../../../common/script/fns/crit';
import updateStats from '../../../common/script/fns/updateStats';

import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';
import Drawer from 'client/components/ui/drawer';
import MouseMoveDirective from 'client/directives/mouseposition.directive';

import mana from 'assets/svg/mana.svg';
import quests from 'common/script/content/quests';

export default {
  mixins: [notifications],
  components: {
    Drawer,
  },
  directives: {
    mousePosition: MouseMoveDirective,
  },
  data () {
    return {
      spells,
      quests,
      applyingAction: false,
      spell: {},
      icons: Object.freeze({
        mana,
      }),
      lastMouseMoveEvent: {},
      potionClickMode: false,
    };
  },
  mounted () {
    this.$root.$on('castEnd', (target, type, $event) => {
      this.castEnd(target, type, $event);
    });

    document.addEventListener('keyup', keyEvent => {
      if (keyEvent.keyCode !== 27) return;
      this.castCancel();
    });
  },
  computed: {
    ...mapState({user: 'user.data'}),
    openStatus () {
      return this.$store.state.spellOptions.spellDrawOpen ? 1 : 0;
    },
  },
  methods: {
    drawerToggled (openChanged) {
      this.$store.state.spellOptions.spellDrawOpen = openChanged;
    },
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
    async castStart (spell) {
      if (this.$store.state.spellOptions.castingSpell) {
        this.castCancel();
        return;
      }

      if (this.user.stats.mp < spell.mana) return this.text(this.$t('notEnoughMana'));

      if (spell.immediateUse && this.user.stats.gp < spell.value) {
        return this.text('Not enough gold.');
      }

      this.potionClickMode = true;
      this.applyingAction = true;
      this.$store.state.spellOptions.castingSpell = true;
      this.spell = spell;

      if (spell.target === 'self') {
        this.castEnd(null, spell.target);
      } else if (spell.target === 'party') {
        if (!this.user.party._id) {
          let party = [this.user];
          this.castEnd(party, spell.target);
          return;
        }

        let party = this.$store.state.party.members;
        party = isArray(party) ? party : [];
        party = party.concat(this.user);
        this.castEnd(party, spell.target);
      } else if (spell.target === 'tasks') {
        let userTasks = this.$store.state.tasks.data;
        // exclude rewards
        let tasks = userTasks.habits
          .concat(userTasks.dailys)
          .concat(userTasks.todos);
        // exclude challenge and group plan tasks
        tasks = tasks.filter((task) => {
          if (task.challenge && task.challenge.id && !task.challenge.broken) return false;
          if (task.group && task.group.id && !task.group.broken) return false;
          return true;
        });
        this.castEnd(tasks, spell.target);
      }
    },
    async castEnd (target, type) {
      if (!this.$store.state.spellOptions.castingSpell) return;
      let beforeQuestProgress = this.questProgress();

      if (!this.applyingAction) return 'No applying action';

      if (this.spell.target !== type) return this.text(this.$t('invalidTarget'));
      if (target && target.type && target.type === 'reward') return this.text(this.$t('invalidTarget'));
      if (target && target.challenge && target.challenge.id) return this.text(this.$t('invalidTarget'));
      if (target && target.group && target.group.id) return this.text(this.$t('invalidTarget'));

      // @TODO: just call castCancel?
      this.$store.state.spellOptions.castingSpell = false;
      this.potionClickMode = false;

      // @TODO: We no longer wrap the users (or at least we should not), but some common code
      // expects the user to be wrapped. For now, just manually set. But we need to fix the common code
      this.user.fns = {
        crit: (...args) => {
          return crit(this.user, ...args);
        },
        updateStats: (...args) => {
          return updateStats(this.user, ...args);
        },
      };

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
      let questProgress = this.questProgress() - beforeQuestProgress;
      if (questProgress > 0) {
        let userQuest = this.quests[this.user.party.quest.key];
        if (userQuest.boss) {
          this.quest('questDamage', questProgress.toFixed(1));
        } else if (userQuest.collection && userQuest.collect) {
          this.quest('questCollection', questProgress);
        }
      }
      // @TOOD: User.sync();
    },
    castCancel () {
      this.potionClickMode = false;
      this.applyingAction = false;
      this.spell = null;
      document.querySelector('body').style.cursor = 'initial';
      this.$store.state.spellOptions.castingSpell = false;
    },
    questProgress () {
      let user = this.user;
      if (!user.party.quest) return 0;

      let userQuest = this.quests[user.party.quest.key];

      if (!userQuest) {
        return 0;
      }

      if (userQuest.boss && user.party.quest.progress.up > 0) {
        return user.party.quest.progress.up;
      }

      if (userQuest.collect && user.party.quest.progress.collectedItems > 0) {
        return user.party.quest.progress.collectedItems;
      }

      return 0;
    },
    // @TODO: Move to mouse move component??
    mouseMoved ($event) {
      // @TODO: throttle
      if (this.potionClickMode) {
        this.$refs.clickPotionInfo.style.left = `${$event.x + 20}px`;
        this.$refs.clickPotionInfo.style.top = `${$event.y + 20}px`;
      } else {
        this.lastMouseMoveEvent = $event;
      }
    },
  },
};
</script>
