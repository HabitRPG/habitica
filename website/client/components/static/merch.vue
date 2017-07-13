<template lang='pug'>
- var layoutEnv = env

  - var merchants = []
  - merchants.push({key: 'teespring', logo: true, name: 'Teespring', link: 'https://teespring.com/habitica-gryphon-t-shirt'})
  - merchants.push({key: 'teespring-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/habitica-gryphon-t-shirt_eu'})
  - merchants.push({key: 'teespring-mug', logo: true, name: 'Teespring', link: 'https://teespring.com/shop/habitica-gryphon-mug'})
  - merchants.push({key: 'teespring-mug-eu', logo: true, name: 'Teespring (EU)', link: 'https://teespring.com/shop/habitica-hydration-mug-eu'})
  - merchants.push({key: 'stickermule', logo: true, name: 'Stickermule', link: 'https://www.stickermule.com/uk/marketplace/9317-habitica-gryphon-sticker'})
.row
    .col-md-12
      .page-header
        h3=env.t('merch')

  // Merchandise block - START
  each merchant, index in merchants
    if (index+1) % 2 !== 0
      .row

    .col-lg-6.col-md-6.col-sm-12
      .merch-block
        if merchant.logo
          img(src="/merch/" + "#{merchant.key}" + "-logo.png")
        else
          h3=merchant.name
        div: a(href="#{merchant.link}" target='_blank'): img.img-rendering-auto(src="/merch/" + "#{merchant.key}" + ".png")
        p=env.t('merch-' + merchant.key + '-summary')
        a.btn(href="#{merchant.link}" target='_blank')=env.t('merch-' + merchant.key + '-goto')
  // Merchandise block - END
  </template>
