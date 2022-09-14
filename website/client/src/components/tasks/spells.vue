<template>
  <div v-if="user.stats.lvl > 10">
    <div
      v-if="potionClickMode"
      ref="clickPotionInfo"
      class="dragInfo mouse"
    >
      <div class="spell">
        <div class="spell-border">
          <div class="mana">
            <div
              class="img"
              :class="`shop_${spell.key} shop-sprite item-img`"
            ></div>
          </div>
        </div>
        <div class="details">
          <!-- @TODO make that translatable-->
          <p class="notes">
            {{ `Select a ${spell.target}` }}
          </p>
        </div>
      </div>
    </div>
    <div class="drawer-wrapper">
      <drawer
        v-if="user.stats.class && !user.preferences.disableClasses"
        v-mousePosition="30"
        :title="drawerTitle"
        :open-status="openStatus"
        @mouseMoved="mouseMoved($event)"
        @toggled="drawerToggled"
      >
        <div slot="drawer-slider">
          <div class="spell-container">
            <div
              v-for="(skill, key) in spells[user.stats.class]"
              :id="`spell_${skill.key}`"
              :key="key"
              @click="!spellDisabled(key) ? castStart(skill) : null"
            >
              <b-popover
                :target="`spell_${skill.key}`"
                triggers="hover"
                placement="top"
                custom-class="popover-class"
              >
                <div class="popover-wrapper">
                  <div class="popover-title">
                    <div class="popover-title-text">
                      {{ skill.text() }}
                    </div>
                    <div class="popover-mana">
                      <div
                        v-once
                        class="popover-svg-icon"
                        v-html="icons.mana"
                      ></div>
                      <div class="popover-mana-count">
                        {{ skill.mana }}
                      </div>
                    </div>
                  </div>
                  <div class="popover-description">
                    {{ skillNotes(skill) }}
                  </div>
                </div>
              </b-popover>
              <div
                class="spell-border"
                :class="{ disabled: spellDisabled(key) || user.stats.lvl < skill.lvl,
                 'insufficient-mana': user.stats.mp < skill.mana }"
              >
                <div
                  class="spell"
                >
                  <div class="details">
                    <div
                      class="img"
                      :class="`shop_${skill.key} shop-sprite item-img`"
                    ></div>
                  </div>
                  <div
                    v-if="user.stats.lvl < skill.lvl"
                    class="mana"
                  >
                    <div class="mana-text level">
                      <div>Level {{ skill.lvl }}</div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="mana"
                  >
                    <div class="mana-text">
                      <div
                        v-once
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
@import '~@/assets/scss/colors.scss';

.drawer-wrapper {
  width: 100vw;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 19;
  display: flex;
  justify-content: center;

  .drawer-container {
    left: auto !important;
    right: auto !important;
    min-width: 25.5rem;
  }
}

.popover-class {
  .popover-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.1em;

    .popover-description {
      text-align: left;
      color: $white;
    }

    .popover-title {
      display: flex;
      justify-content: space-between;
      padding-bottom: 0.5em;

      .popover-title-text {
        font-weight: bold;
        font-size: 1.1em;
        color: $white;
      }

      .popover-mana {
        display: flex;
        gap: 2px;
        justify-content: center;
        align-items: center;

        .popover-svg-icon {
          width: 1.3em;
        }

        .popover-mana-count {
          font-weight: bold;
          color: $blue-100;
          font-size: 1.1em;
        }
      }
    }
  }
}

.spell-container {
  white-space: initial;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-left: -2rem;
  margin-right: -1.5rem;
  margin-top: -0.14rem;
  box-sizing: content-box;

  .spell-border {
    padding: 2px;
    background-color: transparent;
    border-radius: 4px;
    margin-bottom: 1rem;

    &:hover:not(.disabled):not(.insufficient-mana) {
      background-color: $purple-400;
      cursor: pointer;
      box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16),
        0 1px 4px 0 rgba(26, 24, 29, 0.12);
    }

    &.disabled {
      .spell {
        background-color: $gray-10;
        box-shadow: none !important;

        .mana {
          background-color: rgba(26, 24, 29, 0.5);
        }

        .mana-text {
          color: $blue-500;
        }

        .level {
          color: $white;
          font-weight: normal;
        }
      }
    }

    &.insufficient-mana:not(.disabled) {
      opacity: 0.5;
    }

    .spell {
      background: $white;
      border-radius: 4px;
      color: $gray-50;
      padding-right: 0;
      padding-left: 0;
      overflow: hidden;
      width: 4.5rem;
      height: 4.6rem;
      box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12),
        0 1px 2px 0 rgba(26, 24, 29, 0.24);

      &:hover {
        box-shadow: 0 3px 6px 0 rgba(26, 24, 29, 0.16),
          0 3px 6px 0 rgba(26, 24, 29, 0.24);
      }

      .details {
        text-align: center;
        height: 3.1rem;
        display: flex;
        justify-content: center;
        align-items: center;

        .img {
          display: block;
          text-align: center;
        }
      }

      .img {
        margin: 0 auto;
      }

      .mana-text {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.2rem;
        text-align: center;
        color: $blue-1;

        .svg-icon {
          width: 16px;
          height: 16px;
        }
      }

      .mana {
        background-color: rgba(70, 167, 217, 0.15);
        color: $blue-10;
        font-weight: bold;
        height: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

.spell-container-row {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 2em;
  margin-right: -1em;
  margin-left: -1em;
}

.spell-skills {
  flex: 0 0 auto;
  width: 6em;
}

.dragInfo {
  position: absolute;
  left: -500px;
  z-index: 1080;
  color: $gray-500;
  border: none;
  background-color: transparent;
  box-shadow: transparent;

  .spell {
    width: 5.9rem;
    height: 8rem;
    padding-bottom: 0;
    margin-bottom: 0;
    background-color: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1.5rem;

    .spell-border {
      width: 59px;
      height: 62px;
      background: $blue-50;
      border-radius: 4px;
      box-sizing: border-box;
      transform: rotate(45deg);
      padding: 2px;
      display: flex;
      justify-content: center;
      align-items: center;

      .mana {
        width: 58px;
        height: 58px;
        background-color: $gray-700;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        .img {
          background-color: $gray-700;
          display: block;
          text-align: center;
          transform: rotate(-45deg);
        }
      }
    }

    .details {
      margin-top: 1rem;
      width: 100%;
      height: 2em;
      border-radius: 4px;
      background-color: rgba(52, 49, 58, 0.96);

      .notes {
        font-size: 13px;
        color: $white;
        text-align: center;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  &.mouse {
    position: fixed;
    pointer-events: none;
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
import throttle from 'lodash/throttle';

import spells, {
  stealthBuffsToAdd,
} from '@/../../common/script/content/spells';
import { mapState, mapGetters } from '@/libs/store';
import notifications from '@/mixins/notifications';
import spellsMixin from '@/mixins/spells';
import Drawer from '@/components/ui/drawer';
import MouseMoveDirective from '@/directives/mouseposition.directive';

import mana from '@/assets/svg/mana.svg';
import {
  CONSTANTS,
  setLocalSetting,
  getLocalSetting,
} from '@/libs/userlocalManager';

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
    drawerTitle () {
      const classStr = this.$t(this.user.stats.class);
      return this.$t('skillsTitle', { classStr });
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
        setLocalSetting(CONSTANTS.keyConstants.SPELL_DRAWER_STATE,
          CONSTANTS.drawerStateValues.DRAWER_OPEN);
        return;
      }

      setLocalSetting(
        CONSTANTS.keyConstants.SPELL_DRAWER_STATE,
        CONSTANTS.drawerStateValues.DRAWER_CLOSED,
      );
    },
    spellDisabled (skill) {
      const incompleteDailiesDue = this
        .getUnfilteredTaskList('daily')
        .filter(daily => !daily.completed && !daily.group.id && daily.isDue)
        .length;

      if (skill === 'frost' && this.user.stats.buffs.streaks) {
        return true;
      }

      if (skill === 'stealth' && this.user.stats.buffs.stealth >= incompleteDailiesDue) {
        return true;
      }

      return false;
    },
    skillNotes (skill) {
      let notes = skill.notes();

      if (this.user.stats.lvl < skill.lvl) {
        notes = this.$t('spellLevelTooHigh', { level: skill.lvl });
      } else if (skill.key === 'frost' && this.spellDisabled(skill.key)) {
        notes = this.$t('spellAlreadyCast');
      } else if (skill.key === 'stealth' && this.spellDisabled(skill.key)) {
        notes = this.$t('spellAlreadyCast');
      } else if (skill.key === 'stealth') {
        notes = this.$t('spellRogueStealthDaliesAvoided', {
          originalText: notes,
          number: stealthBuffsToAdd(this.user),
        });
      }

      return notes;
    },
    // @TODO: Move to mouse move component??
    mouseMoved: throttle(function mouseMoved ($event) {
      if (this.potionClickMode) {
        this.$refs.clickPotionInfo.style.left = `${$event.x + 20}px`;
        this.$refs.clickPotionInfo.style.top = `${$event.y + 20}px`;
      } else {
        this.lastMouseMoveEvent = $event;
      }
    }, 10),
  },
};
</script>
