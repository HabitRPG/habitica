<template lang="pug">
  b-modal#welcome(:title="$t('welcomeToHabit')", size='lg', :hide-footer="true")
    .modal-body.container-fluid
      .row
        .col-4.col-centered
          span(style='display:flex')
            h1
              | &#9312;
            h3(style='margin:auto auto auto .5em') {{ $t('welcome1') }}
          .welcome_basic_avatars(style='margin: 1.5em auto 1.5em')
          h4 {{ $t('welcome1notes') }}
        .col-4.col-centered
          span(style='display:flex')
            h1
              | &#9313;
            h3(style='margin:.3em auto auto .5em') {{ $t('welcome2') }}
          .welcome_sample_tasks(style='margin: 2.5em auto 1.5em')
          h4 {{ $t('welcome2notes') }}
        .col-4.col-centered
          span(style='display:flex')
            h1
              | &#9314;
            h3(style='margin:auto auto auto .5em') {{ $t('welcome3') }}
          .welcome_promo_party(style='margin: 1em auto 1em')
          h4 {{ $t('welcome3notes') }}
    .modal-footer.text-center(style='margin-top:0')
      .col-3
      .col-6
        button.btn.btn-primary.btn-lg.flex-column(@click='ready()') {{ $t('imReady') }}
      .col-3
</template>

<script>
export default {
  methods: {
    ready () {
      // Guide.goto("intro",0)'
      this.$router.push('/avatar');
      this.$root.$emit('bv::hide::modal', 'welcome');
    },
  },
};
</script>
