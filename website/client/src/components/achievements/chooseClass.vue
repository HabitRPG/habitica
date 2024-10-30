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
      <h1 class="header-purple text-center mb-0">
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
                :sprites-margin="'20px 36px 36px 20px'"
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
              class="danger mb-0"
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

  .btn-primary:active {
      border: 2px solid $purple-400 !important;
      box-shadow: none !important;
    }

  .class-badge {
    $badge-size: 32px;

    width: $badge-size;
    height: $badge-size;
    background: $white;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    border-radius: 50px;

    .svg-icon {
      width: 19px;
      height: 19px;
    }
  }

  .class-explanation {
    font-size: 1rem;
    margin: 24px auto;
  }

  #classOptOutBtn {
    cursor: pointer;
  }

  .class-name {
    font-size: 1.5rem;
    font-weight: bold;
    margin: auto 5px;
  }

  .danger {
    color: $red-50;
  }

  .header-purple {
    color: $purple-200;
    margin-top: 40px;
  }

  .modal-actions {
    margin: 28px auto;
  }

  .opt-out-wrapper {
    margin: 14px 0 7px 0;
  }

  .selection-box {
    border: solid 4px $purple-300;
    border-radius: 16px;
    bottom: -4px;
    height: 150px;
    left: -4px;
    right: -4px;
    top: -4px;
    width: 150px;
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
        return {
          armor: 'armor_rogue_5',
          head: 'head_rogue_5',
          shield: 'shield_rogue_6',
          weapon: 'weapon_rogue_6',
        };
      } if (heroClass === 'wizard') {
        return {
          armor: 'armor_wizard_5',
          head: 'head_wizard_5',
          weapon: 'weapon_wizard_6',
        };
      } if (heroClass === 'healer') {
        return {
          armor: 'armor_healer_5',
          head: 'head_healer_5',
          shield: 'shield_healer_5',
          weapon: 'weapon_healer_6',
        };
      } if (heroClass === 'warrior') {
        return {
          armor: 'armor_warrior_5',
          head: 'head_warrior_5',
          shield: 'shield_warrior_5',
          weapon: 'weapon_warrior_6',
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
