<template>
  <b-modal
    id="card"
    :title="$t(`${cardType}Card`)"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-header">
      <div
        class="pull-right"
        :class="`inventory_special_${cardType}`"
      ></div>
      <h4>{{ $t(`${cardType}Card`) }}</h4>
    </div>
    <div class="modal-body">
      <div style="padding:10px">
        <p>{{ $t('toAndFromCard', { toName: user.profile.name, fromName}) }}</p>
        <hr>
        <div v-markdown="cardMessage"></div>
      </div>
    </div>
    <div class="modal-footer">
      <small class="pull-left">{{ $t(`${cardType}CardExplanation`) }}</small>
      <button
        class="btn btn-secondary"
        @click="readCard()"
      >
        {{ $t('ok') }}
      </button>
    </div>
  </b-modal>
</template>

<style scoped>
</style>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';
import markdown from '@/directives/markdown';

export default {
  directives: {
    markdown,
  },
  props: ['cardOptions'],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    cardType () {
      let type = '';
      if (this.cardOptions && this.cardOptions.cardType) type = this.cardOptions.cardType;
      return type;
    },
    numberOfVariations () {
      let numberOfVariations = 0;
      if (
        this.cardOptions
        && this.cardOptions.messageOptions
      ) numberOfVariations = this.cardOptions.messageOptions;
      return numberOfVariations;
    },
    cardMessage () {
      const random = Math.random() * this.numberOfVariations;
      const selection = Math.floor(random);
      return this.$t(`${this.cardType}${selection}`);
    },
    fromName () {
      let fromName = '';
      const card = this.user.items.special[`${this.cardType}Received`];
      if (card && card[0]) [fromName] = card;
      return fromName;
    },
  },
  methods: {
    async readCard () {
      await axios.post(`/api/v4/user/read-card/${this.cardType}`);
      this.user.items.special[`${this.cardType}Received`].shift();
      this.user.flags.cardReceived = false;
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'card');
    },
  },
};
</script>
