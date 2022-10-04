<template>
  <div
    id="skin"
    class="section customize-section"
  >
    <sub-menu
      class="text-center"
      :items="skinSubMenuItems"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <customize-options
      :items="freeSkins"
      :current-value="user.preferences.skin"
    />
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <div
      v-for="set in seasonalSkins"
      v-if="editing && set.key !== 'undefined'"
      :key="set.key"
    >
      <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      <customize-options
        :items="set.options"
        :current-value="user.preferences.skin"
        :full-set="!hideSet(set.key) && !userOwnsSet('skin', set.keys)"
        @unlock="unlock(`skin.${set.keys.join(',skin.')}`)"
      />
    </div>
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import appearance from '@/../../common/script/content/appearance';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilies } from '../../mixins/avatarEditUtilities';
import appearanceSets from '@/../../common/script/content/appearance/sets';
import subMenu from './sub-menu';
import customizeOptions from './customize-options';
import gem from '@/assets/svg/gem.svg';

const skinsBySet = groupBy(appearance.skin, 'set.key');

const freeSkinKeys = skinsBySet[undefined].map(s => s.key);

// const specialSkinKeys = Object.keys(appearance.shirt)
// .filter(k => appearance.shirt[k].price !== 0);

export default {
  components: {
    subMenu,
    customizeOptions,
  },
  mixins: [
    subPageMixin,
    userStateMixin,
    avatarEditorUtilies,
  ],
  props: [
    'editing',
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
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      const seasonalSkins = [];
      for (const setKey of Object.keys(skinsBySet)) {
        const set = skinsBySet[setKey];

        const keys = set.map(item => item.key);

        const options = keys.map(optionKey => {
          const option = this.mapKeysToOption(optionKey, 'skin', '', setKey);

          return option;
        });

        let text = this.$t(setKey);
        if (appearanceSets[setKey] && appearanceSets[setKey].text) {
          text = appearanceSets[setKey].text();
        }

        const compiledSet = {
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
};
</script>
