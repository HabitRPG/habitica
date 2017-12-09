<template lang="pug">
  b-modal#card(:title="$t(cardType + 'Card')", size='md', :hide-footer="true")
    .modal-header
      .pull-right(:class='`inventory_special_${cardType}`')
      h4 {{ $t(cardType + 'Card') }}
    .modal-body
      div(style='padding:10px')
        p {{ $t('toAndFromCard', { toName: user.profile.name, fromName}) }}
        hr
        div(v-markdown='cardMessage')
    .modal-footer
      small.pull-left {{ $t(cardType + 'CardExplanation')}}
      button.btn.btn-secondary(@click='readCard()') {{ $t('ok') }}
</template>

<style scoped>
</style>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import markdown from 'client/directives/markdown';

export default {
  props: ['cardOptions'],
  directives: {
    markdown,
  },
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
      if (this.cardOptions && this.cardOptions.messageOptions) numberOfVariations = this.cardOptions.messageOptions;
      return numberOfVariations;
    },
    cardMessage () {
      let random = Math.random() * this.numberOfVariations;
      let selection = Math.floor(random);
      return this.$t(`${this.cardType}${selection}`);
    },
    fromName () {
      let fromName = '';
      let card = this.user.items.special[`${this.cardType}Received`];
      if (card && card[0]) fromName = card[0];
      return fromName;
    },
  },
  methods: {
    async readCard () {
      await axios.post(`/api/v3/user/read-card/${this.cardType}`);
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
