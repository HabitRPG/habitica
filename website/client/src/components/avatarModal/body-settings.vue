<template>
  <div
    id="body"
    class="section customize-section"
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
        :items="freeShirts"
        :current-value="user.preferences.shirt"
      />
      <customize-options
        v-if="editing"
        :items="specialShirts"
        :current-value="user.preferences.shirt"
        :full-set="!userOwnsSet('shirt', specialShirtKeys)"
        @unlock="unlock(`shirt.${specialShirtKeys.join(',shirt.')}`)"
      />
    </div>
  </div>
</template>

<script>
import appearance from '@/../../common/script/content/appearance';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilies } from '../../mixins/avatarEditUtilities';
import subMenu from './sub-menu';
import customizeOptions from './customize-options';
import gem from '@/assets/svg/gem.svg';

const freeShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price === 0);
const specialShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price !== 0);

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
      const keys = this.specialShirtKeys;
      const options = keys.map(key => this.mapKeysToOption(key, 'shirt'));
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
