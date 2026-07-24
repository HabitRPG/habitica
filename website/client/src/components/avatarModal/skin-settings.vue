<template>
  <div
    id="skin"
    class="customize-section d-flex flex-column"
    :class="{ 'justify-content-between': editing }"
  >
    <sub-menu
      class="text-center"
      :items="skinSubMenuItems"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <customize-options
      :items="userSkins"
      :current-value="user.preferences.skin"
    />
    <customize-banner v-if="editing" />
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import appearance from '@/../../common/script/content/appearance';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilities } from '../../mixins/avatarEditUtilities';
import customizeBanner from './customize-banner.vue';
import customizeOptions from './customize-options';
import subMenu from './sub-menu';

export default {
  components: {
    subMenu,
    customizeBanner,
    customizeOptions,
  },
  mixins: [
    subPageMixin,
    userStateMixin,
    avatarEditorUtilities,
  ],
  props: [
    'editing',
  ],
  data () {
    return {
      skinSubMenuItems: [
        {
          id: 'color',
          label: this.$t('color'),
        },
      ],
    };
  },
  computed: {
    userSkins () {
      const freeSkins = groupBy(appearance.skin, 'set.key')[undefined]
        .map(s => s.key).map(s => this.mapKeysToFreeOption(s, 'skin'));
      const ownedSkins = Object.keys(this.user.purchased.skin)
        .filter(k => this.user.purchased.skin[k])
        .map(s => this.mapKeysToFreeOption(s, 'skin'));
      return [...freeSkins, ...ownedSkins];
    },
  },
  mounted () {
    this.changeSubPage('color');
  },
};
</script>
