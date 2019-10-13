<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 offset-3">
        <h1>{{ $t('merch') }}</h1>
        <!-- @TODO: Visual experience: Separate each
          merch items with new line? Or to show items in a table?-->
        <div
          v-for="(merchant) in merchants"
          :key="merchant.key"
          class="col-lg-6 col-md-6 col-sm-12"
        >
          <div class="merch-block">
            <img
              v-if="merchant.logo"
              :src="`/static/merch/${merchant.key}-logo.png`"
            >
            <h2 v-else>
              {{ merchant.name }}
            </h2>
            <div>
              <a
                :href="merchant.link"
                target="_blank"
              >
                <img
                  class="img-rendering-auto"
                  :src="`/static/merch/${merchant.key}.png`"
                >
              </a>
            </div>
            <p>{{ $t('merch-' + merchant.key + '-summary') }}</p>
            <a
              class="btn btn-primary"
              :href="merchant.link"
              target="_blank"
            >{{ $t('merch-' + merchant.key + '-goto') }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      merchants: [
        {
          key: 'teespring', logo: true, name: 'Teespring', link: 'https://teespring.com/habitica-gryphon-t-shirt',
        },
        {
          key: 'teespring-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/habitica-gryphon-t-shirt_eu',
        },
        {
          key: 'teespring-mug', logo: true, name: 'Teespring', link: 'https://teespring.com/shop/habitica-gryphon-mug',
        },
        {
          key: 'teespring-mug-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/shop/habitica-hydration-mug-eu',
        },
        {
          key: 'stickermule', logo: true, name: 'Stickermule', link: 'https://www.stickermule.com/uk/marketplace/9317-habitica-gryphon-sticker',
        },
      ],
    };
  },
};
</script>
