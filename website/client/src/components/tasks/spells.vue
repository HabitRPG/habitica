<template>
  <div v-if="user.stats.lvl > 10">
    <div v-if="potionClickMode" ref="clickPotionInfo" class="dragInfo mouse">
      <div class="spell">
        <div class='spell-border'>
          <div class="mana">
            <div class="img" :class="`shop_${spell.key} shop-sprite item-img`"></div>
          </div>
        </div>
        <div class="details">
          <p class="notes">
            {{ `Click on a ${spell.target} to cast!` }}
          </p>
          <!-- @TODO make that translatable-->
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
            <div class="spell-container-row">
              <!-- eslint-disable vue/no-use-v-if-with-v-for -->
              <div
                v-for="(skill, key) in spells[user.stats.class]"
                v-if="user.stats.lvl >= skill.lvl"
                :key="key"
                :id="`spell_${skill.key}`"
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
                        <div class="popover-title-text">{{skill.text()}}</div>
                        <div class="popover-mana">
                          <div class="popover-svg-icon" v-html="icons.mana"></div>
                          <div class="popover-mana-count">{{skill.mana}}</div>
                        </div>
                      </div>
                      <div class="popover-descroption">
                        {{skillNotes(skill)}}
                      </div>
                    </div>
                  </b-popover>
                <!-- eslint-enable vue/no-use-v-if-with-v-for -->
                <div
                class="spell col-12 row"
                :class="{ disabled: spellDisabled(key) }">
                  <div class="col-12 details">
                    <div class="img" :class="`shop_${skill.key} shop-sprite item-img`"></div>
                  </div>
                  <div class="col-12 mana" v-if="user.stats.lvl<skill.lvl">
                    <div class="mana-text">
                      <div>Level {{ skill.lvl }}</div>
                    </div>
                  </div>
                  <div class="col-12 mana" v-else-if="spellDisabled(key)===true">
                    <div class="mana-text">
                      <div class="svg-icon" v-html="icons.mana"></div>
                      <div>{{ skill.mana }}</div>
                    </div>
                  </div>
                  <div class="col-12 mana" v-else>
                    <div class="mana-text">
                      <div class="svg-icon" v-html="icons.mana"></div>
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
    min-width: 38em;
  }
}

.popover-class{
   .popover-wrapper{
     display: flex;
     flex-direction: column;
     gap: 0.1em;
     .popover-title{
       display: flex;
       justify-content: space-between;
       padding-bottom: 0.5em;
       .popover-title-text{
         font-weight: bold;
       }
       .popover-mana{
         display: flex;
         flex-direction: row;
         gap: 2px;
         .popover-svg-icon{
           width: 1em;
         }
         .popover-mana-count{
           font-weight: bold;
           color: #50b5e9;
           font-size: 1em;
         }
       }
     }
   }
}

.spell-container {
  white-space: initial;
  margin-right: -0.65em;
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

.spell:hover:not(.disabled) {
  cursor: pointer;
  border: solid 2px #925cf3;
  box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
}

.spell {
  background: #ffffff;
  border: solid 2px #4e4a57;
  margin-bottom: 1.3em;
  border-radius: 2px;
  color: #4e4a57;
  padding-right: 0;
  padding-left: 0;
  overflow: hidden;
  max-width: 10em;
  box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12);
  &.disabled {
    background-color: #34313a;
    box-shadow: none;
    max-width: 8.6em;

    .mana{
      background-color: rgba(26, 24, 29, 0.5);
    }
  }

  .details {
    text-align: center;
    padding-top: 0.5em;
    min-height: 4em;
    width: 3.6em;

    .img {
      display: inline-block;
    }

    span {
      display: inline-block;
      width: 50%;
      padding-bottom: 0.7em;
      vertical-align: bottom;
    }
  }

  .img {
    margin: 0 auto;
  }

  .mana-text {
    display: flex;
    justify-content: center;
    align-items: center;

    div {
      display: inline-block;
      vertical-align: bottom;
    }

    .svg-icon {
      width: 16px;
      height: 16px;
      margin-right: 0.2em;
    }
  }

  .mana {
    background-color: rgba(70, 167, 217, 0.24);
    color: #2995cd;
    font-weight: bold;
    text-align: center;
    min-height: 2em;
    display: flex;
    justify-content: center;
    align-items: center;

  }
}

.dragInfo {
  position: absolute;
  left: -500px;
  z-index: 1080;
  color: #e1e0e3;
  border: none;
  background-color: transparent;
  box-shadow: transparent;

  .spell {
    border-radius: 4px;
    width: 93px;
    height: 8.3em;
    padding-bottom: 0;
    margin-bottom: 0;
    background-color: transparent;
    border: none;
    box-shadow: none;
    .spell-border{
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      width: 62px;
      height: 62px;
      background-color: #46a7d9;
      margin-left: 1.1em;
      margin-bottom: 0.5em;

      .mana{
        width: 60px;
        height: 60px;
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        background-color: #f9f9f9;
        border-radius: 4px;
        margin-top: 1px;
        margin-bottom: 1px;
        margin-left: 1px;
        margin-right: 1px;

        .img{
          background-color: #f9f9f9;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
      }
    }
    .details{
      width: 100%;
      height: 1em;
      border-radius: 4px;
      background-color: rgba(52, 49, 58, 0.96);

      .notes {
        font-size: 12px;
        color: #e1e0e3;
        height: 100%;
        padding-left: 2px;
        padding-right: 2px;
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
      const incompleteDailiesDue = this.getUnfilteredTaskList('daily').filter(daily => !daily.completed && daily.isDue).length;
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

      if (skill.key === 'frost' && this.spellDisabled(skill.key)) {
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
