<template lang="pug">
  #skin.section.customize-section
    sub-menu.text-center(:items="skinSubMenuItems", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")
    customize-options(
      :items="freeSkins",
      :currentValue="user.preferences.skin"
    )

    div(v-if='editing && set.key !== "undefined"', v-for='set in seasonalSkins')
      customize-options(
        :items='set.options',
        :currentValue="user.preferences.skin",
        :fullSet='!hideSet(set) && !userOwnsSet("skin", set.keys)',
        @unlock='unlock(`skin.${set.keys.join(",skin.")}`)'
      )
</template>

<script>
  import appearance from 'common/script/content/appearance';
  import {subPageMixin} from '../../mixins/subPage';
  import {userStateMixin} from '../../mixins/userState';
  import {avatarEditorUtilies} from '../../mixins/avatarEditUtilities';
  import appearanceSets from 'common/script/content/appearance/sets';
  import subMenu from './sub-menu';
  import customizeOptions from './customize-options';
  import gem from 'assets/svg/gem.svg';

  import groupBy from 'lodash/groupBy';

  const skinsBySet = groupBy(appearance.skin, 'set.key');

  const freeSkinKeys = skinsBySet[undefined].map(s => s.key);

  // const specialSkinKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price !== 0);


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
        freeSkinKeys,
        icons: Object.freeze({
          gem,
        }),
        skinSubMenuItems: [
          {
            id: 'color',
            label: this.$t('color'),
          },
        ],
      };
    },
    computed: {
      freeSkins () {
        return freeSkinKeys.map(s => this.mapKeysToFreeOption(s, 'skin'));
      },
      seasonalSkins () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

        let seasonalSkins = [];
        for (let setKey in skinsBySet) {
          let set = skinsBySet[setKey];

          let keys = set.map(item => {
            return item.key;
          });

          let options = keys.map(optionKey => {
            const option = this.mapKeysToOption(optionKey, 'skin', '', setKey);

            return option;
          });

          let text = this.$t(setKey);
          if (appearanceSets[setKey] && appearanceSets[setKey].text) {
            text = appearanceSets[setKey].text();
          }

          let compiledSet = {
            key: setKey,
            options,
            keys,
            text,
          };
          seasonalSkins.push(compiledSet);
        }

        return seasonalSkins;
      },
    },
    mounted () {
      this.changeSubPage('color');
    },
    methods: {

    },
  };
</script>

<style scoped>

</style>
