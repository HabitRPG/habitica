<template lang="pug">
div.featuredItems
  .background(:class="{broken: broken}")
  .background(:class="{cracked: broken, broken: broken}")
    div.npc
      div.featured-label
        span.rectangle
        span.text {{npcName}}
        span.rectangle
    div.content
      div.featured-label.with-border
        span.rectangle
        span.text {{ featuredText }}
        span.rectangle

      div.items.margin-center
        shopItem(
          v-for="item in featuredItems",
          :key="item.key",
          :item="item",
          :price="item.value",
          :itemContentClass="'shop_'+item.key",
          :emptyItem="false",
          :popoverPosition="'top'",
          @click="featuredItemSelected(item)"
        )
          template(slot="itemBadge", slot-scope="ctx")
            span.badge.badge-pill.badge-item.badge-svg(
              :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.item.pinned}",
              @click.prevent.stop="togglePinned(ctx.item)"
            )
              span.svg-icon.inline.icon-12.color(v-html="icons.pin")

</template>

<script>
  import ShopItem from './shopItem';

  import pinUtils from 'client/mixins/pinUtils';

  import svgPin from 'assets/svg/pin.svg';

  export default {
    mixins: [pinUtils],
    props: {
      broken: Boolean,
      npcName: String,
      featuredText: String,
      featuredItems: Array,
    },
    components: {
      ShopItem,
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
    background: url('~assets/images/npc/broken/market_broken_background.png');
    background-repeat: repeat-x;
  }

  .background.cracked {
    background: url('~assets/images/npc/broken/market_broken_layer.png');
    background-repeat: repeat-x;
  }

  .broken .npc {
    background: url('~assets/images/npc/broken/market_broken_npc.png');
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
