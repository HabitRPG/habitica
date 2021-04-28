<template>
  <b-modal
    id="choose-class"
    size="lg"
    :hide-header="true"
    :hide-footer="true"
    :no-close-on-esc="true"
    :no-close-on-backdrop="true"
  >
    <div class="modal-body select-class">
      <h1 class="header-purple text-center">
        {{ $t('chooseClass') }}
      </h1>
      <div class="container-fluid">
        <br>
        <div class="row">
          <div
            v-for="heroClass in classes"
            :key="`${heroClass}-avatar`"
            class="col-md-3"
          >
            <div @click="selectedClass = heroClass">
              <avatar
                :member="user"
                :avatar-only="true"
                :with-background="false"
                :override-avatar-gear="classGear(heroClass)"
                :hide-class-badge="true"
                :sprites-margin="'1.8em 1.5em'"
                :override-top-padding="'0px'"
                :show-visual-buffs="false"
                :class="selectionBox(selectedClass, heroClass)"
              />
            </div>
          </div>
        </div>
        <br>
        <div
          v-for="heroClass in classes"
          :key="heroClass"
          class="d-flex justify-content-center"
        >
          <div
            v-if="selectedClass === heroClass"
            class="d-inline-flex"
          >
            <div class="class-badge d-flex justify-content-center">
              <div
                class="svg-icon align-self-center"
                v-html="icons[heroClass]"
              ></div>
            </div>
            <div
              class="class-name"
              :class="`${heroClass}-color`"
            >
              {{ $t(heroClass) }}
            </div>
          </div>
        </div>
        <div
          v-for="heroClass in classes"
          :key="`${heroClass}-explanation`"
        >
          <div
            v-if="selectedClass === heroClass"
            class="class-explanation text-center"
          >
            {{ $t(`${heroClass}Text`) }}
          </div>
        </div>
        <div
          v-markdown="$t('chooseClassLearnMarkdown')"
          class="text-center"
        ></div>
        <div class="modal-actions text-center">
          <button
            v-if="!selectedClass"
            class="btn btn-primary d-inline-block"
            :disabled="true"
          >
            {{ $t('select') }}
          </button>
          <button
            v-else
            class="btn btn-primary d-inline-block"
            @click="clickSelectClass(selectedClass); close();"
          >
            {{ $t('selectClass', {heroClass: $t(selectedClass)}) }}
          </button>
          <div class="opt-out-wrapper">
            <span
              id="classOptOutBtn"
              class="danger"
              @click="clickDisableClasses(); close();"
            >{{ $t('optOutOfClasses') }}</span>
          </div>
          <span class="opt-out-description">{{ $t('optOutOfClassesText') }}</span>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .class-badge {
    $badge-size: 32px;

    width: $badge-size;
    height: $badge-size;
    background: $white;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    border-radius: 100px;

    .svg-icon {
      width: 19px;
      height: 19px;
    }
  }

  .class-explanation {
    font-size: 16px;
    margin: 1.5em auto;
  }

  #classOptOutBtn {
    cursor: pointer;
  }

  .class-name {
    font-size: 24px;
    font-weight: bold;
    margin: auto 0.33333em;
  }

  .danger {
    color: $red-50;
    margin-bottom: 0em;
  }

  .header-purple {
    color: $purple-200;
    margin-top: 1.33333em;
    margin-bottom: 0em;
  }

  .modal-actions {
    margin: 2em auto;
  }

  .opt-out-wrapper {
    margin: 1em 0 0.5em 0;
  }

  .selection-box {
    width: 140px;
    height: 148px;
    border-radius: 16px;
    border: solid 4px $purple-300;
  }

  .healer-color {
    color: $yellow-10;
  }

  .rogue-color {
    color: $purple-200;
  }

  .warrior-color {
    color: $red-50;
  }

  .wizard-color {
    color: $blue-10;
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';
import warriorIcon from '@/assets/svg/warrior.svg';
import rogueIcon from '@/assets/svg/rogue.svg';
import healerIcon from '@/assets/svg/healer.svg';
import wizardIcon from '@/assets/svg/wizard.svg';

export default {
  components: {
    Avatar,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      icons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
      selectedClass: 'warrior',
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      classes: 'content.classes',
      currentEvent: 'worldState.data.currentEvent',
    }),
    eventName () {
      if (
        !this.currentEvent || !this.currentEvent.event || !this.currentEvent.gear
      ) return null;
      return this.currentEvent.event;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'choose-class');
    },
    clickSelectClass (heroClass) {
      if (this.user.flags.classSelected && !window.confirm(this.$t('changeClassConfirmCost'))) return; // eslint-disable-line no-alert
      this.$store.dispatch('user:changeClass', { query: { class: heroClass } });
    },
    clickDisableClasses () {
      this.$store.dispatch('user:disableClasses');
    },
    classGear (heroClass) {
      if (heroClass === 'rogue') {
        if (this.eventName) {
          return {
            armor: `armor_special_${this.eventName}Rogue`,
            head: `head_special_${this.eventName}Rogue`,
            shield: `shield_special_${this.eventName}Rogue`,
            weapon: `weapon_special_${this.eventName}Rogue`,
          };
        }
        return {
          armor: 'armor_rogue_5',
          head: 'head_rogue_5',
          shield: 'shield_rogue_6',
          weapon: 'weapon_rogue_6',
        };
      } if (heroClass === 'wizard') {
        if (this.eventName) {
          return {
            armor: `armor_special_${this.eventName}Mage`,
            head: `head_special_${this.eventName}Mage`,
            weapon: `weapon_special_${this.eventName}Mage`,
          };
        }
        return {
          armor: 'armor_wizard_5',
          head: 'head_wizard_5',
          weapon: 'weapon_wizard_6',
        };
      } if (heroClass === 'healer') {
        if (this.eventName) {
          return {
            armor: `armor_special_${this.eventName}Healer`,
            head: `head_special_${this.eventName}Healer`,
            shield: `shield_special_${this.eventName}Healer`,
            weapon: `weapon_special_${this.eventName}Healer`,
          };
        }
        return {
          armor: 'armor_healer_5',
          head: 'head_healer_5',
          shield: 'shield_healer_5',
          weapon: 'weapon_healer_6',
        };
      }
      if (this.eventName) {
        return {
          armor: `armor_special_${this.eventName}Warrior`,
          head: `head_special_${this.eventName}Warrior`,
          shield: `shield_special_${this.eventName}Warrior`,
          weapon: `weapon_special_${this.eventName}Warrior`,
        };
      }
      return {
        armor: 'armor_warrior_5',
        head: 'head_warrior_5',
        shield: 'shield_warrior_5',
        weapon: 'weapon_warrior_6',
      };
    },
    selectionBox (selectedClass, heroClass) {
      if (selectedClass === heroClass) {
        return 'selection-box';
      }

      return null;
    },
  },
};
</script>
