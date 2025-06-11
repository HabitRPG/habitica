<template>
  <div class="container-fluid text-center">
    <div class="row">
      <div class="col-md-12">
        <h1>{{ $t('marketing1Header') }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-12 mb-5 mb-md-0">
        <img :src="makeUrl('features_taskboard.png')" class="img-fluid">
        <h2>{{ $t('marketing1Lead1Title') }}</h2>
        <div class="row justify-content-md-center">
          <p class="col col-lg-8 col-xl-6 margin-auto">{{ $t('marketing1Lead1') }}</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_gear.png')">
        <h2>{{ $t('marketing1Lead2Title') }}</h2>
        <p>{{ $t('marketing1Lead2') }}</p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_items.png')">
        <h2>{{ $t('marketing1Lead3Title') }}</h2>
        <p>{{ $t('marketing1Lead3') }}</p>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-12">
        <h1>{{ $t('marketing2Header') }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <h2>{{ $t('marketing2Lead1Title') }}</h2>
        <p>{{ $t('marketing2Lead1') }}</p>
        <img :src="makeUrl('features_monsters.png')">
        <h2>{{ $t('marketing2Lead2Title') }}</h2>
        <p v-markdown="$t('marketing2Lead2')"></p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_challenges.png')">
        <h2>{{ $t('marketing2Lead3Title') }}</h2>
        <p>{{ $t('marketing2Lead3') }}</p>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-12">
        <h1>{{ $t('marketing3Header') }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_mobile.png')">
        <h2>{{ $t('footerMobile') }}</h2>
        <p v-markdown="$t('marketing3Lead1')"></p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_opensource.png')">
        <h2>{{ $t('marketing3Lead2Title') }}</h2>
        <p v-markdown="$t('marketing3Lead2')"></p>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-12">
        <h1>{{ $t('marketing4Header') }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <div class="media">
          <img src="@/assets/images/marketing/education.png">
          <div class="media-body">
            <h2>{{ $t('marketing4Lead1Title') }}</h2>
            <p>{{ $t('marketing4Lead1') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <div class="media">
          <img src="@/assets/images/marketing/wellness.png">
          <div class="media-body">
            <h2>{{ $t('marketing4Lead2Title') }}</h2>
            <p>{{ $t('marketing4Lead2') }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 offset-md-3 mb-5 mb-md-0">
        <h2>{{ $t('marketing4Lead3Title') }}</h2>
        <img :src="makeUrl('features_gamify.png')">
        <div class="cta-container">
          <h3>{{ $t('marketing4Lead3-1') }}</h3>
          <button
            class="btn btn-lg btn-primary"
            @click="playButtonClick()"
          >
            {{ $t('playButton') }}
          </button>
        </div>
        <div>
          <h3>{{ $t('marketing4Lead3-2') }}</h3>
          <a
            class="btn btn-lg btn-primary"
            href="/static/plans"
            target="_blank"
          >{{ $t('contactUs') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  img {
    max-width: 400px;

    @media (max-width: 1200px) {
      width: 100%;
    }
  }

  .img-fluid {
    width: 100%;
    max-width: 900px;
  }

  .cta-container {
    text-align: center;
    margin: 2em auto;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('features'),
    });
  },
  methods: {
    playButtonClick () {
      this.$router.push('/register');
    },
    makeUrl (filename) {
      return `https://habitica-assets.s3.amazonaws.com/assets/${filename}`;
    },
  },
};
</script>
