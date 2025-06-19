<template>
  <div class="container-fluid text-center">
    <div class="row">
      <div class="col-md-12">
        <h1>{{ $t('marketing1Header') }}</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-12 mb-5 mb-md-0">
        <img
          :src="makeUrl('features_taskboard.png')"
          class="img-fluid"
        >
        <h2>{{ $t('marketing1Lead1Title') }}</h2>
        <div class="row justify-content-md-center">
          <p class="col col-lg-8 col-xl-6 margin-auto description">
            {{ $t('marketing1Lead1') }}
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_gear.png')">
        <h2>{{ $t('marketing1Lead2Title') }}</h2>
        <p class="description">
          {{ $t('marketing1Lead2') }}
        </p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_items.png')">
        <h2>{{ $t('marketing1Lead3Title') }}</h2>
        <p class="description">
          {{ $t('marketing1Lead3') }}
        </p>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-12">
        <h1>{{ $t('marketing2Header') }}</h1>
      </div>
    </div>
    <div class="row mb-5">
      <div class="col-12">
        <h2>{{ $t('marketing2Lead1Title') }}</h2>
        <p class="description">
          {{ $t('marketing2Lead1') }}
        </p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_monsters.png')">
        <h2>{{ $t('marketing2Lead2Title') }}</h2>
        <p
          v-markdown="$t('marketing2Lead2')"
          class="description"
        ></p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_challenges.png')">
        <h2>{{ $t('marketing2Lead3Title') }}</h2>
        <p class="description">
          {{ $t('marketing2Lead3') }}
        </p>
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
        <h2>{{ $t('marketing3Lead1Title') }}</h2>
        <p
          v-markdown="$t('marketing3Lead1')"
          class="description"
        ></p>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <img :src="makeUrl('features_opensource.png')">
        <h2>{{ $t('marketing3Lead2Title') }}</h2>
        <p
          v-markdown="$t('marketing3Lead2')"
          class="description"
        ></p>
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
            <p class="description">
              {{ $t('marketing4Lead1') }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-5 mb-md-0">
        <div class="media">
          <img src="@/assets/images/marketing/wellness.png">
          <div class="media-body">
            <h2>{{ $t('marketing4Lead2Title') }}</h2>
            <p class="description">
              {{ $t('marketing4Lead2') }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-5">
      <div class="col-md-6 offset-md-3 mb-5 mb-md-0">
        <h1>{{ $t('marketing4Lead3Title') }}</h1>
        <img :src="makeUrl('features_gamify.png')">
        <div class="cta-container">
          <h2>{{ $t('marketing4Lead3-1') }}</h2>
          <button
            class="btn btn-lg btn-primary"
            @click="playButtonClick()"
          >
            {{ $t('marketing4Lead3Button') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  img {
    max-width: 350px;

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

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .description {
    max-width: 600px;
    margin: auto;
    font-size: 1.1rem;
    line-height: 1.6rem;
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
