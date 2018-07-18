<template lang="pug">
  b-modal#participant-list(title='Empty', size='md', :hide-footer='true')
    .header-wrap(slot='modal-header')
      .row
        .col-6
          h1(v-once) {{ $t('participantsTitle') }}
        .col-6
          button(type='button' aria-label='Close' class='close', @click='close()')
            span(aria-hidden="true") ×
    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('close') }}
</template>

<script>
export default {
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'participant-list');
    },
  },
};
</script>