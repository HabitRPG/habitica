<template lang="pug">
  .container-fluid
    .row
      .col-md-6.offset-3
        h1 {{ $t('merch') }}
        // @TODO: Visual experience: Separate each merch items with new line? Or to show items in a table?
        .col-lg-6.col-md-6.col-sm-12(v-for="(merchant, index) in merchants")
          .merch-block
            img(v-if='merchant.logo' :src="`/static/merch/${merchant.key}-logo.png`")
            h2(v-else) {{ merchant.name }}
            div
              a(:href="merchant.link" target='_blank')
                img.img-rendering-auto(:src="`/static/merch/${merchant.key}.png`")
            p {{ $t('merch-' + merchant.key + '-summary') }}
            a.btn.btn-primary(:href="merchant.link" target='_blank') {{$t('merch-' + merchant.key + '-goto')}}
			
</template>

<script>
  export default {
    data () {
      return {
        merchants: [
          {key: 'teespring', logo: true, name: 'Teespring', link: 'https://teespring.com/habitica-gryphon-t-shirt'},
          {key: 'teespring-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/habitica-gryphon-t-shirt_eu'},
          {key: 'teespring-mug', logo: true, name: 'Teespring', link: 'https://teespring.com/shop/habitica-gryphon-mug'},
          {key: 'teespring-mug-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/shop/habitica-hydration-mug-eu'},
          {key: 'stickermule', logo: true, name: 'Stickermule', link: 'https://www.stickermule.com/uk/marketplace/9317-habitica-gryphon-sticker'},
        ],
      };
    },
  };
</script>
