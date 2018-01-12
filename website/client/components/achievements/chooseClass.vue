<template lang="pug">
  b-modal#choose-class(
    size='lg',
    :hide-header='true',
    :hide-footer='true',
    :no-close-on-esc='true',
    :no-close-on-backdrop='true',
  )
    .modal-body.select-class
      h1.header-purple.text-center {{ $t('chooseClass') }}
      .container-fluid
        br
        .row
          .col-md-3(v-for='heroClass in classes')
            div(@click='selectedClass = heroClass')
              avatar(
                :member='user',
                :avatarOnly='true',
                :withBackground='false',
                :overrideAvatarGear='classGear(heroClass)',
                :hideClassBadge='true',
                :spritesMargin='"1.8em 1.5em"',
                :overrideTopPadding='"0px"',
                :class='selectionBox(selectedClass, heroClass)',
              )
        br
        .d-flex.justify-content-center(v-for='heroClass in classes')
          .d-inline-flex(v-if='selectedClass === heroClass')
            .class-badge.d-flex.justify-content-center
              .svg-icon.align-self-center(v-html='icons[heroClass]')
            .class-name(:class='`${heroClass}-color`') {{ $t(heroClass) }}
        div(v-for='heroClass in classes')
          .class-explanation.text-center(v-if='selectedClass === heroClass') {{ $t(`${heroClass}Text`) }}
        .text-center(v-markdown='$t("chooseClassLearnMarkdown")')
        .modal-actions.text-center
          button.btn.btn-primary.d-inline-block(v-if='!selectedClass', :disabled='true') {{ $t('select') }}
          button.btn.btn-primary.d-inline-block(v-else, @click='clickSelectClass(selectedClass); close();') {{ $t('selectClass', {heroClass: $t(selectedClass)}) }}
          .opt-out-wrapper
            span#classOptOutBtn.danger(@click='clickDisableClasses(); close();') {{ $t('optOutOfClasses') }}
          span.opt-out-description {{ $t('optOutOfClassesText') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
import { mapState } from 'client/libs/store';
import markdownDirective from 'client/directives/markdown';
import warriorIcon from 'assets/svg/warrior.svg';
import rogueIcon from 'assets/svg/rogue.svg';
import healerIcon from 'assets/svg/healer.svg';
import wizardIcon from 'assets/svg/wizard.svg';

export default {
  components: {
    Avatar,
  },
  computed: {
    ...mapState({
      user: 'user.data',
      classes: 'content.classes',
    }),
  },
  data () {
    return {
      icons: Object.freeze({
        warrior: warriorIcon,
        rogue: rogueIcon,
        healer: healerIcon,
        wizard: wizardIcon,
      }),
      selectedClass: '',
    };
  },
  directives: {
    markdown: markdownDirective,
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'choose-class');
    },
    clickSelectClass (heroClass) {
      if (this.user.flags.classSelected && !confirm(this.$t('changeClassConfirmCost'))) return;
      this.$store.dispatch('user:changeClass', {query: {class: heroClass}});
    },
    clickDisableClasses () {
      this.$store.dispatch('user:disableClasses');
    },
    classGear (heroClass) {
      if (heroClass === 'rogue') {
        return {
          armor: 'armor_special_winter2018Rogue',
          head: 'head_special_winter2018Rogue',
          shield: 'shield_special_winter2018Rogue',
          weapon: 'weapon_special_winter2018Rogue',
        };
      } else if (heroClass === 'wizard') {
        return {
          armor: 'armor_special_winter2018Mage',
          head: 'head_special_winter2018Mage',
          weapon: 'weapon_special_winter2018Mage',
        };
      } else if (heroClass === 'healer') {
        return {
          armor: 'armor_special_winter2018Healer',
          head: 'head_special_winter2018Healer',
          shield: 'shield_special_winter2018Healer',
          weapon: 'weapon_special_winter2018Healer',
        };
      } else {
        return {
          armor: 'armor_special_winter2018Warrior',
          head: 'head_special_winter2018Warrior',
          shield: 'shield_special_winter2018Warrior',
          weapon: 'weapon_special_winter2018Warrior',
        };
      }
    },
    selectionBox (selectedClass, heroClass) {
      if (selectedClass === heroClass) {
        return 'selection-box';
      }
    },
  },
};
</script>
