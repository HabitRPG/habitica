<template>
  <b-modal
    id="world-boss-rage"
    title
    :hide-footer="true"
    :hide-header="true"
  >
    <div v-if="npc === 'seasonalShop'">
      <div class="modal-header d-flex align-items-center justify-content-center">
        <div class="reduce">
          {{ $t('seasonalShopRageStrikeHeader') }}
        </div>
      </div>
      <img
        class="npc-background"
      >
      <div class="modal-body">
        <div class="row">
          <div class="col-12 text-center padding-24">
            <h2>{{ $t('seasonalShopRageStrikeLead') }}</h2>
            <p>{{ $t('seasonalShopRageStrikeRecap') }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="npc === 'market'">
      <div class="modal-header d-flex align-items-center justify-content-center">
        <div class="reduce">
          {{ $t('marketRageStrikeHeader') }}
        </div>
      </div>
      <img
        class="npc-background"
      >
      <div class="modal-body">
        <div class="row">
          <div class="col-12 text-center padding-24">
            <h2>{{ $t('marketRageStrikeLead') }}</h2>
            <p>{{ $t('marketRageStrikeRecap') }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="npc === 'quests'">
      <div class="modal-header d-flex align-items-center justify-content-center">
        <div class="reduce">
          {{ $t('questsRageStrikeHeader') }}
        </div>
      </div>
      <img
        class="npc-background"
      >
      <div class="modal-body">
        <div class="row">
          <div class="col-12 text-center padding-24">
            <h2>{{ $t('questsRageStrikeLead') }}</h2>
            <p>{{ $t('questsRageStrikeRecap') }}</p>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
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
  data () {
    return {
      npc: 'seasonalShop',
    };
  },
  computed: {
    npcOption () {
      return this.$store.state.rageModalOptions.npc;
    },
  },
  watch: {
    npcOption () {
      this.npc = this.$store.state.rageModalOptions.npc;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'world-boss-rage');
    },
  },
};
</script>
