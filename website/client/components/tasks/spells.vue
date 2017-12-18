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

  drawer(
    :title="$t('skillsTitle')",
    v-if='user.stats.class && !user.preferences.disableClasses',
    v-mousePosition="30",
    @mouseMoved="mouseMoved($event)",
    :openStatus='openStatus',
    @toggled='drawerToggled'
  )
    div(slot="drawer-slider")
      .container.spell-container
        .row
          .col-3(
            @click='castStart(skill)',
            v-for='(skill, key) in spells[user.stats.class]',
            v-if='user.stats.lvl >= skill.lvl',
            v-b-popover.hover.auto='skill.notes()')
            .spell.col-12.row
              .col-8.details
                a(:class='{"disabled": spellDisabled(key)}')
                div.img(:class='`shop_${skill.key} shop-sprite item-img`')
                span.title {{skill.text()}}
              .col-4.mana
                .mana-text
                  .svg-icon(v-html="icons.mana")
                  div {{skill.mana}}
</template>

<style lang="scss" scoped>
  .drawer-container {
    left: calc((100% - 978px) / 2);
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
    border: solid 2px #50b5e9;
  }

  .spell {
    background: #ffffff;
    border: solid 2px transparent;
    margin-bottom: 1em;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    border-radius: 1000px;
    color: #4e4a57;
    padding-right: 0;
    padding-left: 0;
    overflow: hidden;

    .details {
      text-align: left;
      padding-top: .5em;
      padding-right: .1em;

      .img {
        display: inline-block;
      }

      span {
        display: inline-block;
        width: 50%;
        padding-bottom: .7em;
        vertical-align: bottom;
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
      padding-top: 1.1em;

      div {
        display: inline-block;
        vertical-align: bottom;
      }

      .svg-icon {
        width: 16px;
        height: 16px;
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
        margin-bottom: .2em;
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
import spells from '../../../common/script/content/spells';

import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';
import spellsMixin from 'client/mixins/spells';
import Drawer from 'client/components/ui/drawer';
import MouseMoveDirective from 'client/directives/mouseposition.directive';

import mana from 'assets/svg/mana.svg';
import quests from 'common/script/content/quests';
import { CONSTANTS, setLocalSetting, getLocalSetting } from 'client/libs/userlocalManager';

export default {
  mixins: [notifications, spellsMixin],
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

    // @TODO: should we abstract the drawer state/local store to a library and mixing combo? We use a similar pattern in equipment
    const spellDrawerState = getLocalSetting(CONSTANTS.keyConstants.SPELL_DRAWER_STATE);
    if (spellDrawerState === CONSTANTS.valueConstants.DRAWER_CLOSED) {
      this.$store.state.spellOptions.spellDrawOpen = false;
    }
  },
  computed: {
    ...mapState({user: 'user.data'}),
    openStatus () {
      return this.$store.state.spellOptions.spellDrawOpen ? 1 : 0;
    },
  },
  methods: {
    drawerToggled (newState) {
      this.$store.state.spellOptions.spellDrawOpen = newState;

      if (newState) {
        setLocalSetting(CONSTANTS.keyConstants.SPELL_DRAWER_STATE, CONSTANTS.valueConstants.DRAWER_OPEN);
        return;
      }

      setLocalSetting(CONSTANTS.keyConstants.SPELL_DRAWER_STATE, CONSTANTS.valueConstants.DRAWER_CLOSED);
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
