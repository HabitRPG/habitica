<template lang="pug">
  #body.section.customize-section
    sub-menu.text-center(:items="items", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")
    .row(v-if='activeSubPage === "size"')
      .col-12.customize-options.size-options
        .option(v-for='option in ["slim", "broad"]', :class='{active: user.preferences.size === option}')
          .sprite.customize-option(:class="`${option}_shirt_black`", @click='set({"preferences.size": option})')
    .row(v-if='activeSubPage === "shirt"')
      customize-options.col-12(
        :items="freeShirts",
        propertyToChange="preferences.shirt",
        :currentValue="user.preferences.shirt"
      )
      .col-12.customize-options(v-if='editing')
        .option(v-for='item in specialShirts',
          :class='{active: item.active, locked: item.locked}')
          .sprite.customize-option(:class="`broad_shirt_${item.key}`", @click='item.click')
          .gem-lock(v-if='item.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("shirt", specialShirtKeys)')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`shirt.${specialShirtKeys.join(",shirt.")}`)') {{ $t('purchaseAll') }}
</template>

<script>
  import appearance from 'common/script/content/appearance';
  import {subPageMixin} from '../../mixins/subPage';
  import {userStateMixin} from '../../mixins/userState';
  import {avatarEditorUtilies} from '../../mixins/avatarEditUtilities';
  import subMenu from './sub-menu';
  import customizeOptions from './customize-options';
  import gem from 'assets/svg/gem.svg';

  const freeShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price === 0);
  const specialShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price !== 0);


  export default {
    props: [
      'editing',
    ],
    components: {
      subMenu,
      customizeOptions,
    },
    mixins: [
      subPageMixin,
      userStateMixin,
      avatarEditorUtilies,
    ],
    data () {
      return {
        freeShirts: freeShirtKeys.map(s => ({
          key: s,
          class: `slim_shirt_${s}`,
        })),
        specialShirtKeys,
        icons: Object.freeze({
          gem,
        }),
        items: [
          {
            id: 'size',
            label: this.$t('size'),
          },
          {
            id: 'shirt',
            label: this.$t('shirt'),
          },
        ],
      };
    },
    computed: {
      specialShirts () {
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.specialShirtKeys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'shirt');
        });
        return options;
      },
    },
    mounted () {
      this.changeSubPage('size');
    },
    methods: {

    },
  };
</script>

<style scoped>

</style>
