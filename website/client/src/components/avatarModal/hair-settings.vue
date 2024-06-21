<template>
  <div
    id="hair"
    class="customize-section d-flex flex-column"
    :class="{ 'justify-content-between': editing && !showEmptySection}"
  >
    <sub-menu
      class="text-center"
      :items="hairSubMenuItems"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <div
      v-if="activeSubPage === 'color'"
      id="hair-color"
    >
      <customize-options
        :items="userHairColors"
        :current-value="user.preferences.hair.color"
      />
    </div>
    <div
      v-if="activeSubPage === 'bangs'"
      id="bangs"
    >
      <customize-options
        :items="hairBangs"
        :current-value="user.preferences.hair.bangs"
      />
    </div>
    <div
      v-if="activeSubPage === 'style'"
      id="style"
    >
      <customize-options
        :items="userHairStyles"
        :current-value="user.preferences.hair.base"
      />
    </div>
    <div
      v-if="activeSubPage === 'facialhair'"
      id="facialhair"
    >
      <customize-options
        v-if="userMustaches.length > 1"
        :items="userMustaches"
      />
      <customize-options
        v-if="userBeards.length > 1"
        :items="userBeards"
      />
      <div
        v-if="showEmptySection"
        class="my-5"
      >
        <h3
          v-once
        >
          {{ $t('noItemsOwned') }}
        </h3>
        <p
          v-once
          class="w-50 mx-auto"
          v-html="$t('visitCustomizationsShop')"
        ></p>
      </div>
    </div>
    <customize-banner
      v-if="editing && !showEmptySection"
    />
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import appearance from '@/../../common/script/content/appearance';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilities } from '../../mixins/avatarEditUtilities';
import customizeBanner from './customize-banner';
import customizeOptions from './customize-options';
import subMenu from './sub-menu';

export default {
  components: {
    customizeBanner,
    customizeOptions,
    subMenu,
  },
  mixins: [
    subPageMixin,
    userStateMixin,
    avatarEditorUtilities,
  ],
  props: [
    'editing',
  ],
  computed: {
    hairSubMenuItems () {
      const items = [
        {
          id: 'color',
          label: this.$t('color'),
        },
        {
          id: 'bangs',
          label: this.$t('bangs'),
        },
        {
          id: 'style',
          label: this.$t('style'),
        },
      ];

      if (this.editing) {
        items.push({
          id: 'facialhair',
          label: this.$t('facialhair'),
        });
      }

      return items;
    },
    userHairColors () {
      const freeHairColors = groupBy(appearance.hair.color, 'set.key')[undefined]
        .map(s => s.key).map(s => this.mapKeysToFreeOption(s, 'hair', 'color'));
      const ownedHairColors = Object.keys(this.user.purchased.hair.color || {})
        .filter(k => this.user.purchased.hair.color[k])
        .map(h => this.mapKeysToFreeOption(h, 'hair', 'color'));
      return [...freeHairColors, ...ownedHairColors];
    },
    userHairStyles () {
      const emptyHairStyle = {
        ...this.mapKeysToFreeOption(0, 'hair', 'base'),
        none: true,
      };
      const freeHairStyles = [1, 3].map(s => this.mapKeysToFreeOption(s, 'hair', 'base'));
      const ownedHairStyles = Object.keys(this.user.purchased.hair.base || {})
        .filter(k => this.user.purchased.hair.base[k])
        .map(h => this.mapKeysToFreeOption(h, 'hair', 'base'));
      return [emptyHairStyle, ...freeHairStyles, ...ownedHairStyles];
    },
    userMustaches () {
      const emptyMustache = {
        ...this.mapKeysToFreeOption(0, 'hair', 'mustache'),
        none: true,
      };
      const ownedMustaches = Object.keys(this.user.purchased.hair.mustache || {})
        .filter(k => this.user.purchased.hair.mustache[k])
        .map(h => this.mapKeysToFreeOption(h, 'hair', 'mustache'));

      return [emptyMustache, ...ownedMustaches];
    },
    userBeards () {
      const emptyBeard = {
        ...this.mapKeysToFreeOption(0, 'hair', 'beard'),
        none: true,
      };
      const ownedBeards = Object.keys(this.user.purchased.hair.beard || {})
        .filter(k => this.user.purchased.hair.beard[k])
        .map(h => this.mapKeysToFreeOption(h, 'hair', 'beard'));

      return [emptyBeard, ...ownedBeards];
    },
    hairBangs () {
      const none = this.mapKeysToFreeOption(0, 'hair', 'bangs');
      none.none = true;

      const options = [1, 2, 3, 4].map(s => this.mapKeysToFreeOption(s, 'hair', 'bangs'));

      return [none, ...options];
    },
    showEmptySection () {
      return this.activeSubPage === 'facialhair'
        && this.userMustaches.length === 1 && this.userBeards.length === 1;
    },
  },
  mounted () {
    this.changeSubPage('color');
  },
};
</script>
