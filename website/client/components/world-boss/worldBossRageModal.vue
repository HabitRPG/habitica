<template lang="pug">
  b-modal#world-boss-rage(title="", :hide-footer="true", :hide-header="true")
    .modal-header.d-flex.align-items-center.justify-content-center
      .reduce {{ $t('seasonalShopRageStrikeHeader') }}
    img.npc-background(src='~assets/images/npc/broken/rage-strike-seasonalShop-scaled@2x.png')
    .modal-body
      .row
        .col-12.text-center.padding-24
          h2 {{ $t('seasonalShopRageStrikeLead') }}
          p {{ $t('seasonalShopRageStrikeRecap') }}
</template>

<style>
  #world-boss-rage .modal-body {
    padding: 0;
    width: 376px;
  }
  #world-boss-rage .modal-content {
    width: 378px;
  }
</style>

<style lang='scss' scoped>
  .modal-header {
    background-color: #FA8537;
    color: white;
    height: 2em;
  }

  .npc-background {
    max-width: 376px;
    height: auto;
    margin-top: -1px;
  }

  .padding-24 {
    padding-top: 1em;
    padding-left: 3em;
    padding-right: 3em;
    padding-bottom: 1em;
  }

  .reduce {
    font-size: 12px;
  }

</style>

<script>
  export default {
    methods: {
      close () {
        this.$root.$emit('bv::hide::modal', 'world-boss-rage');
      },
    },
  };
</script>
