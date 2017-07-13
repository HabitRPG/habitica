<template lang='pug'>
  div.jumbotron
      h1= env.t('presskit')
      p= env.t('presskitText', { pressEnquiryEmail : env.EMAILS.PRESS_ENQUIRY_EMAIL })
      p
        a.btn.btn-lg.btn-success(href='/presskit/presskit.zip') presskit.zip

    -
      var imgs = {
        'Promo': [
          'Promo',
          'Promo - Thin'
        ],
        'Logo': [
          'Icon with Text',
          'Habitica Gryphon',
          'iOS',
          'Android'
        ],
        'Boss': [
          'Basi-List',
          'Stagnant Dishes',
          'SnackLess Monster',
          'Laundromancer',
          'Necro-Vice',
          'Battling the Ghost Stag',
          'Dread Drag\'on of Dilatory'
        ],
        'Samples': {
          'Website': [
            'Tasks Page',
            'Equipment',
            'Market',
            'Guilds',
            'Challenges'
          ],
          'iOS': [
            'Tasks Page',
            'Level Up',
            'Pets',
            'Party',
            'Boss'
          ],
          'Android': [
            'User',
            'Tasks Page',
            'Reward',
            'Level Up',
            'Tavern',
            'Party'
          ]
        }
      }
    each images, category in imgs
      div
        h2= env.t('pk' + category)
        if Array.isArray(images)
          each img in images
            img.img-rendering-auto.press-img(src="/presskit/#{category}/#{img}.png")
        else
          each item, cat in images
            div
              h3= env.t('pk' + cat)
              each img in item
                img.img-rendering-auto.press-img(src="/presskit/#{category}/#{cat}/#{img}.png")
</template>
