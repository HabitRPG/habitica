<template>
  <div v-if="user.stats.lvl > 10">
    <div
      v-if="potionClickMode"
      ref="clickPotionInfo"
      class="dragInfo mouse"
    >
      <div class="spell col-12 row">
        <div class="col-8 details">
          <p class="title">
            {{ spell.text() }}
          </p>
          <p class="notes">
            {{ `Click on a ${spell.target} to cast!` }}
          </p>
          <!-- @TODO make that translatable-->
        </div>
        <div class="col-4 mana">
          <div
            class="img"
            :class="`shop_${spell.key} shop-sprite item-img`"
          ></div>
        </div>
      </div>
    </div>
    <div class="drawer-wrapper d-flex justify-content-center">
      <drawer
        v-if="user.stats.class && !user.preferences.disableClasses"
        v-mousePosition="30"
        :title="$t('skillsTitle')"
        :open-status="openStatus"
        @mouseMoved="mouseMoved($event)"
        @toggled="drawerToggled"
      >
        <div slot="drawer-slider">
          <div class="container spell-container">
            <div class="row">
              <!-- eslint-disable vue/no-use-v-if-with-v-for -->
              <div
                v-for="(skill, key) in spells[user.stats.class]"
                v-if="user.stats.lvl >= skill.lvl"
                :key="key"
                v-b-popover.hover.auto="skillNotes(skill)"
                class="col-12 col-md-3"
                @click="castStart(skill)"
              >
                <!-- eslint-enable vue/no-use-v-if-with-v-for -->
                <div class="spell col-12 row">
                  <div class="col-8 details">
                    <a :class="{'disabled': spellDisabled(key)}"></a>
                    <div
                      class="img"
                      :class="`shop_${skill.key} shop-sprite item-img`"
                    ></div>
                    <span class="title">{{ skill.text() }}</span>
                  </div>
                  <div class="col-4 mana">
                    <div class="mana-text">
                      <div
                        class="svg-icon"
                        v-html="icons.mana"
                      ></div>
                      <div>{{ skill.mana }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .drawer-wrapper {
    width: 100vw;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 19;

    .drawer-container {
      left: auto !important;
      right: auto !important;
      min-width: 60%;
    }
  }

  .drawer-container {
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
import spells, { stealthBuffsToAdd } from '@/../../common/script/content/spells';

import { mapState, mapGetters } from '@/libs/store';
import notifications from '@/mixins/notifications';
import spellsMixin from '@/mixins/spells';
import Drawer from '@/components/ui/drawer';
import MouseMoveDirective from '@/directives/mouseposition.directive';

import mana from '@/assets/svg/mana.svg';
import { CONSTANTS, setLocalSetting, getLocalSetting } from '@/libs/userlocalManager';

export default {
  components: {
    Drawer,
  },
  directives: {
    mousePosition: MouseMoveDirective,
  },
  mixins: [notifications, spellsMixin],
  data () {
    return {
      spells,
      applyingAction: false,
      spell: {},
      icons: Object.freeze({
        mana,
      }),
      lastMouseMoveEvent: {},
      potionClickMode: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    ...mapGetters({
      getUnfilteredTaskList: 'tasks:getUnfilteredTaskList',
    }),
    openStatus () {
      return this.$store.state.spellOptions.spellDrawOpen ? 1 : 0;
    },
  },
  mounted () {
    // @TODO: should we abstract the drawer state/local
    // store to a library and mixing combo? We use a similar pattern in equipment
    const spellDrawerState = getLocalSetting(CONSTANTS.keyConstants.SPELL_DRAWER_STATE);
    if (spellDrawerState === CONSTANTS.drawerStateValues.DRAWER_CLOSED) {
      this.$store.state.spellOptions.spellDrawOpen = false;
    }
  },
  methods: {
    drawerToggled (newState) {
      this.$store.state.spellOptions.spellDrawOpen = newState;

      if (newState) {
        setLocalSetting(
          CONSTANTS.keyConstants.SPELL_DRAWER_STATE,
          CONSTANTS.drawerStateValues.DRAWER_OPEN,
        );
        return;
      }

      setLocalSetting(
        CONSTANTS.keyConstants.SPELL_DRAWER_STATE,
        CONSTANTS.drawerStateValues.DRAWER_CLOSED,
      );
    },
    spellDisabled (skill) {
      const incompleteDailiesDue = this.getUnfilteredTaskList('daily').filter(daily => !daily.completed && daily.isDue).length;
      if (skill === 'frost' && this.user.stats.buffs.streaks) return true;
      if (skill === 'stealth' && this.user.stats.buffs.stealth >= incompleteDailiesDue) return true;

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
          number: stealthBuffsToAdd(this.user),
        });
      }

      return notes;
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
