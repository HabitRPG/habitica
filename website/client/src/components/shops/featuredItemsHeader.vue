<template>
  <div class="featuredItems">
    <div
      class="background"
      :class="{broken: broken}"
    ></div>
    <div
      class="background"
      :class="{cracked: broken, broken: broken}"
    >
      <div class="npc">
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
                class="badge badge-pill badge-item badge-svg"
                :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}"
                @click.prevent.stop="togglePinned(ctx.item)"
              >
                <span
                  class="svg-icon inline icon-12 color"
                  v-html="icons.pin"
                ></span>
              </span>
            </template>
          </shopItem>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShopItem from './shopItem';

import pinUtils from '@/mixins/pinUtils';

import svgPin from '@/assets/svg/pin.svg';

export default {
  components: {
    ShopItem,
  },
  mixins: [pinUtils],
  props: {
    broken: Boolean,
    npcName: String,
    featuredText: String,
    featuredItems: Array,
  },
  data () {
    return {
      icons: Object.freeze({
        pin: svgPin,
      }),
    };
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

  .background.broken {
    background: url('~@/assets/images/npc/broken/market_broken_background.png');
    background-repeat: repeat-x;
  }

  .background.cracked {
    background: url('~@/assets/images/npc/broken/market_broken_layer.png');
    background-repeat: repeat-x;
  }

  .broken .npc {
    background: url('~@/assets/images/npc/broken/market_broken_npc.png');
    background-repeat: no-repeat;
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
