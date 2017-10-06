<template lang="pug">
  .container-fluid.text-center
    .row
      .col-md-12
        h1 {{ $t('marketing1Header') }}
    .row
      .col-md-6
        img(src='~assets/images/marketing/screenshot.png')
        h2 {{ $t('marketing1Lead1Title') }}
        p {{ $t('marketing1Lead1') }}
      .col-md-6
        img(src='~assets/images/marketing/gear.png')
        h2 {{ $t('marketing1Lead2Title') }}
        p {{ $t('marketing1Lead2') }}
        img(src='~assets/images/marketing/drops.png', style='max-height: 200px;')
        h2 {{ $t('marketing1Lead3Title') }}
        p {{ $t('marketing1Lead3') }}
    hr
    .row
      .col-md-12
        h1 {{ $t('marketing2Header') }}
    .row
      .col-md-6
        img(src='~assets/images/marketing/guild.png')
        h2 {{ $t('marketing2Lead1Title') }}
        p {{ $t('marketing2Lead1') }}
        img(src='~assets/images/marketing/vice3.png')
        h2 {{ $t('marketing2Lead2Title') }}
        p(v-markdown='$t("marketing2Lead2")')
      .col-md-6
        img(src='~assets/images/marketing/challenge.png')
        h2 {{ $t('marketing2Lead3Title') }}
        p {{ $t('marketing2Lead3') }}
    hr
    .row
      .col-md-12
        h1 {{ $t('marketing3Header') }}
    .row
      .col-md-6
        img(src='~assets/images/marketing/android_iphone.png')
        h2 {{ $t('footerMobile') }}
        p(v-markdown='$t("marketing3Lead1")')
      .col-md-6
        img(src='~assets/images/marketing/integration.png')
        h2 {{ $t('marketing3Lead2Title') }}
        p(v-markdown='$t("marketing3Lead2")')
    hr
    .row
      .col-md-12
        h1 {{ $t('marketing4Header') }}
    .row
      .col-md-6
        .media
          img(src='~assets/images/marketing/education.png')
          .media-body
            h2 {{ $t('marketing4Lead1Title') }}
            p {{ $t('marketing4Lead1') }}
      .col-md-6
        .media
          img(src='~assets/images/marketing/wellness.png')
          .media-body
            h2 {{ $t('marketing4Lead2Title') }}
            p {{ $t('marketing4Lead2') }}
    .row
      .col-md-6.offset-md-3
        h2 {{ $t('marketing4Lead3Title') }}
        img(src='~assets/images/marketing/lefnire.png')
        p.span
          span {{ $t('marketing4Lead3-1') }}
          button.btn.btn-primary(@click='playButtonClick()') {{ $t('playButton') }}
        p.span
          span {{ $t('marketing4Lead3-2') }}
          a.btn.btn-primary(href='/static/plans',target='_blank') {{ $t('contactUs') }}
</template>

<style lang='scss' scoped>
  .btn {
    margin-left: 1em;
  }

  img {
    box-shadow: 0 0 10px 5px #888;
    margin: 0.5em;
    max-width: 500px;
  }
</style>

<script>
  import markdownDirective from 'client/directives/markdown';

  export default {
    directives: {
      markdown: markdownDirective,
    },
    methods: {
      playButtonClick () {
        this.$router.push('/register');
      },
    },
  };
</script>
