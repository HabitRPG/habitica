<template>
  <div
    id="body"
    class="customize-section d-flex flex-column"
    :class="{ 'justify-content-between': editing }"
  >
    <sub-menu
      class="text-center"
      :items="items"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <div v-if="activeSubPage === 'size'">
      <customize-options
        :items="sizes"
        :current-value="user.preferences.size"
      />
    </div>
    <div v-if="activeSubPage === 'shirt'">
      <customize-options
        :items="userShirts"
        :current-value="user.preferences.shirt"
      />
    </div>
    <customize-banner v-if="editing" />
  </div>
</template>

<script>
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
    userShirts () {
      const freeShirts = Object.keys(appearance.shirt)
        .filter(k => appearance.shirt[k].price === 0)
        .map(s => this.mapKeysToFreeOption(s, 'shirt'));
      const ownedShirts = Object.keys(this.user.purchased.shirt)
        .filter(k => this.user.purchased.shirt[k])
        .map(s => this.mapKeysToFreeOption(s, 'shirt'));

      return [...freeShirts, ...ownedShirts];
    },
  },
  mounted () {
    this.changeSubPage('size');
  },
};
</script>
