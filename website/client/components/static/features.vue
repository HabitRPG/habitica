<template lang="pug">
  .row#about-page
    .col-md-12#aboutPage
      .marketing
        h1 {{ $t('marketing1Header') }}
        .row
          .col-md-6
            a.gallery(href='/marketing/screenshot.png', :title="$t('marketing1Header')")
              img.img-rendering-auto(src='/marketing/screenshot.png')
            p.lead {{ $t('marketing1Lead1') }}
          .col-md-6

            a.gallery(href='/marketing/gear.png', :title="$t('marketing1Lead2Title')")
              img.img-rendering-auto(src='/marketing/gear.png')
            p.lead(v-html="$t('marketing1Lead2')")

            a.gallery(href='/marketing/drops.png', :title="$t('marketing1Lead3Title')")
              img.img-rendering-auto(src='/marketing/drops.png',style='max-height:200px')
            p.lead(v-html="$t('marketing1Lead3')")

            // TODO achievements
        hr.clearfix

        h1 {{ $t('marketing2Header') }}
        .row
          .col-md-6
            a.gallery(href='/marketing/guild.png', :title="$t('marketing2Header')")
              img.img-rendering-auto(src='/marketing/guild.png')
            p.lead {{ $t('marketing2Lead1') }}
            a.gallery(href='/marketing/vice3.png', :title="$t('marketing2Lead2Title')")
              img(src='/marketing/vice3.png')
            p.lead(v-html="$t('marketing2Lead2')")
          .col-md-6
            a.gallery(href='/marketing/challenge.png', :title="$t('challenges')")
              img.img-rendering-auto(src='/marketing/challenge.png')
            p.lead(v-html="$t('marketing2Lead3')")

        hr.clearfix

        h1 {{ $t('marketing3Header') }}
        .row
          .col-md-6
            a.gallery(href='/marketing/android_iphone.png', :title="$t('marketing3LeadTitle')")
              img.img-rendering-auto(src='/marketing/android_iphone.png',style='box-shadow:none;')
            p.lead(v-html="$t('marketing3Lead1')")
          .col-md-6
            a.gallery(href='/marketing/integration.png', :title="$t('marketing3LeadTitle')")
              img.img-rendering-auto(src='/marketing/integration.png')
            p.lead(v-html="$t('marketing3Lead2')")

        hr.clearfix

        h1 {{ $t('marketing4Header') }}
        .row
          .col-md-6
            h3 {{ $t('marketing4Lead1Title') }}
            img.pull-left(src='/marketing/education.png')
            p.lead {{ $t('marketing4Lead1') }}
          .col-md-6
            h3 {{ $t('marketing4Lead2Title') }}
            img.pull-left(src='/marketing/wellness.png')
            p.lead {{ $t('marketing4Lead2') }}
        .row
          .col-md-6.col-md-offset-3
            h3 {{ $t('marketing4Lead3Title') }}
            img.img-rendering-auto(src='/marketing/lefnire.png')
            p.lead
              | {{ $t('marketing4Lead3-1') }}
              |&nbsp;
              button.btn.btn-primary(ng-click='playButtonClick()') {{ $t('playButton') }}
              |&nbsp;
              | {{ $t('marketing4Lead3-2') }}
              |&nbsp;
              a.btn.btn-primary(href='/static/plans',target='_blank') {{ $t('contactUs') }}
              |&nbsp;
              | {{ $t('marketing4Lead3-3') }}
              |&nbsp;
              a.btn.btn-primary(href='/static/videos') {{ $t('watchVideos') }}


        hr
        p.lead {{ $t('landingp1') }}
        h2 {{ $t('landingp2header') }}
        //images in these parts could be useful, too
        //if there's a language workaround, image headers? people like pictures!
        p.lead
          | {{ $t('landingp2') }}
          |&nbsp;
        h2 {{ $t('landingp3header') }}
        //I'm not sold on "Consquences as the title here. Anyone got a better idea?
        p.lead
          | {{ $t('landingp3') }}
          |&nbsp;
        h2 {{ $t('landingp4header') }}
        p.lead {{ $t('landingp4') }}
        //- TODO
          h2 {{ $t('landingend') }}
          p.lead
             {{ $t('landingend2') }}
            a(href="FEATURESPAGEHERE") {{ $t('landingfeatureslink') }}
             {{ $t('landingend3') }}
            a(href="ENTERPRISEPAGEHERE") {{ $t('landingadminlink') }}
            |&nbsp;
             {{ $t('landingend4') }}
</template>
