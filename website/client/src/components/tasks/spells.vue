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
            {{ `Select a ${spell.target}` }}
          </p>
          <!-- @TODO make that translatable-->
        </div>
      </div>
    </div>
    <div class="drawer-wrapper">
      <drawer
        v-if="user.stats.class && !user.preferences.disableClasses"
        v-mousePosition="30"
        :title="$t('skillsTitle')"
        :open-status="openStatus"
        @mouseMoved="mouseMoved($event)"
        @toggled="drawerToggled"
      >
        <div slot="drawer-slider">
          <div class="spell-container">
              <!-- eslint-disable vue/no-use-v-if-with-v-for -->
              <div
                v-for="(skill, key) in spells[user.stats.class]"
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
                      <div class="popover-description">
                        {{skillNotes(skill)}}
                      </div>
                    </div>
                  </b-popover>
                <!-- eslint-enable vue/no-use-v-if-with-v-for -->
                <div
                class="spell"
                :class="{ disabled: spellDisabled(key) || user.stats.lvl<skill.lvl }">
                  <div class="details">
                    <div class="img" :class="`shop_${skill.key} shop-sprite item-img`"></div>
                  </div>
                  <div class="mana" v-if="user.stats.lvl<skill.lvl">
                    <div class="mana-text level">
                      <div>Level {{ skill.lvl }}</div>
                    </div>
                  </div>
                  <div class="mana" v-else-if="spellDisabled(key)===true">
                    <div class="mana-text">
                      <div class="svg-icon" v-html="icons.mana"></div>
                      <div>{{ skill.mana }}</div>
                    </div>
                  </div>
                  <div class="mana" v-else>
                    <div class="mana-text">
                      <div class="svg-icon" v-html="icons.mana"></div>
                      <div>{{ skill.mana }}</div>
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
  display: flex;
  justify-content: center;

  .drawer-container {
    left: auto !important;
    right: auto !important;
    min-width: 25.5rem;
  }
}

.popover-class{
   .popover-wrapper{
     display: flex;
     flex-direction: column;
     gap: 0.1em;
     .popover-description{
       text-align: left;
     }
     .popover-title{
       display: flex;
       justify-content: space-between;
       padding-bottom: 0.5em;
       .popover-title-text{
         font-weight: bold;
         font-size: 1.1em;
         color: #ffffff;
       }
       .popover-mana{
         display: flex;
         gap: 2px;
         justify-content: center;
         align-items: center;
         .popover-svg-icon{
           width: 1.3em;
         }
         .popover-mana-count{
           font-weight: bold;
           color: #50b5e9;
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
  .spell {
    background: #ffffff;
    border: solid 2px #4e4a57;
    margin-bottom: 1rem;
    border-radius: 4px;
    color: #4e4a57;
    padding-right: 0;
    padding-left: 0;
    overflow: hidden;
    width: 4.6rem;
    height: 4.6rem;

    &:hover{
      box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12);
      border-radius: 2px;
    }
    &.disabled {
      background-color: #34313a;
      box-shadow: none;

      .mana{
        background-color: rgba(26, 24, 29, 0.5);
      }

      .level{
        color: #c3c0c7;
        font-weight: normal;
      }
    }

    .details {
      text-align: center;
      height: 3rem;
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

      .svg-icon {
        width: 16px;
        height: 14px;
      }
    }

    .mana {
      background-color: rgba(70, 167, 217, 0.24);
      color: #2995cd;
      font-weight: bold;
      height: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 3px;
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

.spell:hover:not(.disabled) {
  cursor: pointer;
  border: solid 2px #925cf3;
  box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
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
    width: 5.9rem;
    height: 6.5rem;
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
        margin-left: 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .img{
          background-color: #f9f9f9;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
      }
    }
    .details{
      width: 100%;
      height: 2em;
      border-radius: 4px;
      background-color: rgba(52, 49, 58, 0.96);

      .notes {
        font-size: 13px;
        color: #e1e0e3;
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
