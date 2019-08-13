<template lang="pug">
  #body.section.customize-section
    sub-menu.text-center(:items="items", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")
    div(v-if='activeSubPage === "size"')
      customize-options(
        :items="sizes",
        propertyToChange="preferences.size",
        :currentValue="user.preferences.size"
      )
    div(v-if='activeSubPage === "shirt"')
      customize-options(
        :items="freeShirts",
        propertyToChange="preferences.shirt",
        :currentValue="user.preferences.shirt"
      )
      customize-options(
        v-if='editing',
        :items='specialShirts',
        propertyToChange="preferences.shirt",
        :currentValue="user.preferences.shirt",
        :fullSet='!userOwnsSet("shirt", specialShirtKeys)',
        @unlock='unlock(`shirt.${specialShirtKeys.join(",shirt.")}`)'
      )
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
      sizes () {
        return ['slim', 'broad'].map(s => this.mapKeysToFreeOption(s, 'size'));
      },
      freeShirts () {
        return freeShirtKeys.map(s => this.mapKeysToFreeOption(s, 'shirt'));
      },
      specialShirts () {
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.specialShirtKeys;
        let options = keys.map(key => this.mapKeysToOption(key, 'shirt'));
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
