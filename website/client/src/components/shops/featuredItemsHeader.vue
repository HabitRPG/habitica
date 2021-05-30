<template>
  <div class="featuredItems">
    <div
      class="background"
    ></div>
    <div
      class="background"
      :style="{
        background: bgUrl,
        'background-repeat': 'repeat-x',
      }"
    >
      <div
        class="npc"
        :style="{
          background: npcUrl,
          'background-repeat': 'no-repeat',
        }"
      >
        <div class="featured-label">
          <span class="rectangle"></span>
          <span class="text">{{ npcName }}</span>
          <span class="rectangle"></span>
        </div>
      </div>
      <div class="content">
        <div class="featured-label with-border">
          <span class="rectangle"></span>
          <span class="text">{{ featuredText }}</span>
          <span class="rectangle"></span>
        </div>
        <div class="items margin-center">
          <shopItem
            v-for="item in featuredItems"
            :key="item.key"
            :item="item"
            :price="item.value"
            :item-content-class="'shop_'+item.key"
            :empty-item="false"
            :popover-position="'top'"
            @click="featuredItemSelected(item)"
          >
            <template
              slot="itemBadge"
              slot-scope="ctx"
            >
              <span
                class="badge-top"
                @click.prevent.stop="togglePinned(ctx.item)"
              >
                <pin-badge
                  :pinned="ctx.item.pinned"
                />
              </span>
            </template>
          </shopItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PinBadge from '@/components/ui/pinBadge';
import ShopItem from './shopItem';

import pinUtils from '@/mixins/pinUtils';

export default {
  components: {
    PinBadge,
    ShopItem,
  },
  mixins: [pinUtils],
  props: {
    npcName: String,
    bgUrl: String,
    npcUrl: String,
    featuredText: String,
    featuredItems: Array,
  },
  methods: {
    featuredItemSelected (item) {
      this.$emit('featuredItemSelected', item);
    },
  },
};
</script>

<style lang="scss" scoped>
.featuredItems {
  height: 216px;

  .background {
    width: 100%;
    height: 216px;
    position: absolute;

    top: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .badge-pin:not(.pinned) {
      display: none;
    }

  .item:hover .badge-pin {
    display: block;
  }

  .content {
    display: flex;
    flex-direction: column;
    z-index: 1; // Always cover background.
  }

  .npc {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 216px;
  }
}

  .featured-label {
    margin: 24px auto;
  }

  @media only screen and (max-width: 768px) {
    .featuredItems .content {
      display: none !important;
    }
  }
</style>
