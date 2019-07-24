<template lang="pug">
  #body.section.customize-section
    sub-menu.text-center(:items="items", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")
    .row(v-if='activeSubPage === "size"')
      customize-options.col-12(
        :items="sizes",
        propertyToChange="preferences.size",
        :currentValue="user.preferences.size"
      )
    .row(v-if='activeSubPage === "shirt"')
      customize-options.col-12(
        :items="freeShirts",
        propertyToChange="preferences.shirt",
        :currentValue="user.preferences.shirt"
      )
      customize-options.col-12(
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
        return ['slim', 'broad'].map(s => ({
          key: s,
          class: `${s}_shirt_black`,
        }));
      },
      freeShirts () {
        return freeShirtKeys.map(s => ({
          key: s,
          class: `${this.user.preferences.size}_shirt_${s}`,
        }));
      },
      specialShirts () {
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.specialShirtKeys;
        let options = keys.map(key => {
          const option = this.mapKeysToOption(key, 'shirt');
          option.class = `${this.user.preferences.size}_shirt_${key}`;

          return option;
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
