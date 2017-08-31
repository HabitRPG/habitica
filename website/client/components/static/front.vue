<template lang="pug">
  div
    noscript.banner {{ $t('jsDisabledHeadingFull') }}
      br
      a(href='http://www.enable-javascript.com/', target='_blank') {{ $t('jsDisabledLink') }}

    static-header

    #intro.container-fluid
      .row
        h1.col-12.text-center {{ $t('motivate1') }}
      .row
        .col-6.offset-3
          img.img-rendering-auto.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/intro.png', alt='')
          // The empty alt attribute isn't a mistake, it's part of the spec for purely decorative images that add no information
          // insert intro images
      .row
        .introcall.bg-success.col-12.text-center.cta
          h2 {{ $t('joinOthers', {userCount}) }}
            small
              button#play-btn.btn.btn-primary.btn-lg.gamifybutton(@click='playButtonClick()') {{ $t('free') }}
      .row
        .col-12.presslogos.text-center.img-rendering-auto
          h2 {{ $t('featuredIn') }}
          br
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/lifehacker.png', alt="$t(altAttrLifehacker)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/nyt-logo.png', alt="$t(altAttrNewYorkTimes)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/makeuseof.png', alt="$t(altAttrMakeUseOf)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/Forbes_logo.png', alt="$t(altAttrForbes)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/Cnetlogo.png', alt="$t(altAttrCnet)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/Fast-Company-logo.png', alt="$t(altAttrFastCompany)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/kickstarter-logo.png', alt="$t(altAttrKickstarter)")
          img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/discover-logo.png', alt="$t(altAttrDiscover)")
    #intro-text.container-fluid
      .row
        .col-8.offset-2
          p.lead.text-center
            | {{ $t('leadText') }}
    section#testimonial-carousel.bg-info.container-fluid
      .row
        .col-3.offset-1
          h2 {{ $t('testimonialHeading') }}
          img.img-say.img-responsive.visible-lg-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/publicSpaces.png', alt='')
        .col-8
          #quote-carousel.container-fluid(data-interval='10000', data-ride='carousel')
            .row.text-center
              .item.col-12.active
                blockquote
                  p
                  | {{ $t('dragonsilverQuote') }}
                  small Drag0nsilver
              .item.col-12
                blockquote
                  p
                  | {{ $t('frabjabulousQuote') }}
                  small frabjabulous
              .item.col-12
                blockquote
                  p
                  | {{ $t('andeeliaoQuote') }}
                  small AndeeLiao
              .item.col-12
                blockquote
                  p
                  | {{ $t('alexandraQuote') }}
                  small _AlexandraSo_
            .row
              .col-6.offset-3.text-center.user-selector
                .user-icon.active(data-target='#quote-carousel', data-slide-to='0')
                  img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Drag0nsilver.png', alt='')
                .user-icon(data-target='#quote-carousel', data-slide-to='1')
                  img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/frabjabulous.png', alt='')
                .user-icon(data-target='#quote-carousel', data-slide-to='2')
                  img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/AndeeLiao.png', alt='')
                .user-icon(data-target='#quote-carousel', data-slide-to='3')
                  img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/AlexandraSo.png', alt='')
        .col-12.text-center
          button.btn.btn-primary.btn-lg.gamifybutton.fixedcta(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#uses.container-fluid
      .row
        h2.col-12.text-center {{ $t('examplesHeading') }}
      .row
        #myCarousel.col-12.carousel.slide(data-interval='10000', data-ride='carousel')
          ul.nav.nav-pills.nav-fill
            li.nav-item.active(data-target='#myCarousel', data-slide-to='0')
              a(href='#') {{ $t('work') }}
            li.nav-item(data-target='#myCarousel', data-slide-to='1')
              a(href='#') {{ $t('wellness') }}
            li.nav-item(data-target='#myCarousel', data-slide-to='2')
              a(href='#') {{ $t('teams') }}
            li.nav-item(data-target='#myCarousel', data-slide-to='3')
              a(href='#') {{ $t('school') }}
            li.nav-item(data-target='#myCarousel', data-slide-to='4')
              a(href='#') {{ $t('goals') }}
            li.nav-item(data-target='#myCarousel', data-slide-to='5')
              a(href='#') {{ $t('chores') }}
          .carousel-inner(style='z-index:0;display:none')
            .item.active.work-use
              h3
                | {{ $t('work') }}
                br
                small
                  a(href='/static/plans') {{ $t('businessText') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleHabits') }}
                  div(style='width:100%; background-color: rgb(252, 229, 205); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(219, 120, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('businessSample1') }}
                  br
                  div(style='width:100%; background-color: rgb(201, 218, 248); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(90, 98, 223); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('businessSample2') }}
                  br
                  div(style='width:100%; background-color: #d9ead3; color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(113, 176, 91); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('businessSample3') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('businessSample4') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(220, 93, 93); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('businessSample5') }}
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/coding.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='frabjabulous', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/frabjabulous.png', alt="$t(altAttrFrabjabulous)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('frabjabulousQuote') }}
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='_AlexandraSo_', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/AlexandraSo.png', alt="$t(altAttrAlexandraSo)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('alexandraQuote') }}
            .item.health-use
              h3 {{ $t('health') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleHabits') }}
                  div(style='width:100%; background-color: #d9ead3; color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(113, 176, 91); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(113, 176, 91); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('healthSample1') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(220, 93, 93); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('healthSample2') }}
                  br
                  div(style='width:100%; background-color: #d9ead3; color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(113, 176, 91); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(113, 176, 91); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('healthSample3') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(255, 207, 66); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('healthSample4') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('healthSample5') }}
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/clipart-rosemonkeyct-meditation.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='EvaGantz', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/EvaGantz.png', alt="$t(altAttrEvaGantz)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('evagantzQuote') }}
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='supermouse35', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/supermouse35.png', :alt="$t('altAttrSupermouse35')")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                      |  {{ $t('supermouse35Quote') }}
            .item.team-use
              h3 {{ $t('teams') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleToDo') }}
                  div(style='width:100%; background-color: rgb(252, 229, 205); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(219, 120, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('teamSample1') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('teamSample2') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('teamSample3') }}
                  br
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/publicSpaces.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='Althaire', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Althaire.png', alt="$t(altAttrAlthaire)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('althaireQuote') }}
            .item.school-use
              h3 {{ $t('school') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleHabits') }}
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('schoolSample1') }}
                  br
                  div(style='width:100%; background-color: #d9ead3; color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(113, 176, 91); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('schoolSample2') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('schoolSample3') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(220, 93, 93); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('schoolSample4') }}
                  br
                  div(style='width:100%; background-color: rgb(201, 218, 248); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(90, 98, 223); border-right: 1px solid rgba(0, 0, 0, 0.25);') +
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; background-color: rgb(90, 98, 223); border-right: 0px none;') -
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('schoolSample5') }}
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/reading.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='InfH', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/InfH.png', alt="$t(altAttrInfH)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content {{ $t('infhQuote') }}
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='Drei-M', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Drei-M.png', alt="$t(altAttrDreiM)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('dreimQuote') }}
            .item.improvement-use
              h3 {{ $t('goals') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleDailies') }}
                  div(style='width:100%; background-color: rgb(252, 229, 205); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(219, 120, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('goalSample1') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('goalSample2') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('goalSample3') }}
                  br
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/gaining_an_achievement_by_cosmic_caterpillar-d7uyv5z.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='Kazui', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Kazui.png', alt="$t(altAttrKazui)")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('kazuiQuote') }}
            .item.housework-use
              h3 {{ $t('chores') }}
              .carousel-content.row
                .sampletasks.col-lg-4.col-6.col-xs-12
                  h4 {{ $t('sampleDailies') }}
                  div(style='width:100%; background-color: rgb(252, 229, 205); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(219, 120, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('choreSample1') }}
                  br
                  div(style='width:100%; background-color: rgb(255, 242, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(255, 207, 66); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('choreSample2') }}
                  br
                  div(style='width:100%; background-color: rgb(244, 204, 204); color: rgb(51, 51, 51); text-align:center; padding: 0px; line-height: 1.62765; list-style: none outside none; padding: 0px; height: 2.3em; min-height: 1.62765em; margin-bottom:0.75em; margin:0px; box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.5) inset;')
                    .task-btn(style='display: inline-block; width: 1.62765em; height: 1.62765em; padding: 0px; margin:0px; line-height: 1.62765; text-align: center; color: rgb(34, 34, 34); float:left; cursor: pointer; vertical-align: top; left:0px; position:relative; background-color: rgb(220, 93, 93); border-right: 1px solid rgba(0, 0, 0, 0.25);')
                      span(style='padding: 0.5em 0px 0em 0em; color: #666;') &#x2610;
                    | &nbsp;
                    .task-desc(style='display: inline-block; font-family: Lato,sans-serif; padding: 0.6em 0px 0em 1em; letter-spacing: normal; float:left; word-wrap: break-word;') {{ $t('choreSample3') }}
                  br
                img.sample-img.visible-lg-inline-block(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/uses/dusting_by_leephon.png', alt='')
                .usetweet-groups.col-lg-5.col-6.visible-lg-inline-block.visible-inline-block
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='autumnesquirrel', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/autumnesquirrel.png', :alt="$t('altAttrAutumnesquirrel')")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content {{ $t('autumnesquirrelQuote') }}
                  .usetweet-group
                    img(data-toggle='tooltip', data-placement='top', title='irishfeet123', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/irishfeet123.png', :alt="$t('altAttrIrishfeet123')")
                    .usetweet.tweet.popover.right
                      .arrow
                      .popover-content
                        | {{ $t('irishfeet123Quote') }}
      .row
        .col-6.offset-3.text-center
          button.btn.btn-primary.btn-lg.gamifybutton.fixedcta(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#rewards.bg-warning.container-fluid
      .row
        .col-6
          h2.headline {{ $t('rewardHeading') }}
          p.sectioninfo
            | {{ $t('rewardByline1') }}
            br
            br
            | {{ $t('rewardByline2') }}
          .scrolltweet.hidden-xs.hidden-sm
            img.img-rendering-auto.scrolltweet-image(data-toggle='tooltip', data-placement='top', title='Elmi', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Elmi.png', alt="$t(altAttrElmi)")
            .tweet.popover.right.pull-right
              .arrow
              .popover-content {{ $t('elmiQuote') }}
        .col-6
          .avatarscroll
            h2
              span.glyphicon.glyphicon-check
            h2
              span.glyphicon.glyphicon-arrow-down
            img.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/misc/shop_gold.png', alt='')
            img.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/misc/shop_gold.png', alt='')
            img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/misc/shop_gold.png', alt='')
            h2
              span.glyphicon.glyphicon-arrow-down
            img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/TVreward.png', alt='')
        .col-12
          button.btn.btn-primary.btn-lg.fixedcta.gamifybutton(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#levels.container-fluid
      .row
        .col-6.text-center
          h2.headline {{ $t('unlockHeadline') }}
          p.sectioninfo
            | {{ $t('unlockByline1') }}
            br
            br
            | {{ $t('unlockByline2') }}
          .scrolltweet.hidden-xs.hidden-sm
            img.img-rendering-auto.scrolltweet-image(data-toggle='tooltip', data-placement='top', title='16bitFil', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/16bitFil.png', :alt="$t('altAttr16bitFil')")
            .tweet.popover.right.pull-right
              .arrow
              .popover-content
                | {{ $t('sixteenBitFilQuote') }}
        .col-6
          .avatarscroll
            img.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/avatar/avatarstatic.png', alt='')
            h2
              span.glyphicon.glyphicon-arrow-down
            img.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/SAMPLEadventurers.png', alt='')
        .col-12
          button.btn.btn-primary.btn-lg.fixedcta.gamifybutton(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#health.bg-danger.container-fluid
      .row
        .col-6
          h2.headline {{ $t('punishHeading1') }}
          h2 {{ $t('punishHeading2') }}
          p.sectioninfo {{ $t('punishByline') }}
          .scrolltweet.hidden-xs.hidden-sm
            img.scrolltweet-image(data-toggle='tooltip', data-placement='top', title='Zelah Meyer', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/Zelah_Meyer.png', alt="$t(altAttrZelahMeyer)")
            .tweet.popover.right.pull-right
              .arrow
              .popover-content
                | {{ $t('zelahQuote') }}
        .col-6
          h2
            span.glyphicon.glyphicon-unchecked
          .health-progress
            .meter-label(tooltip='Health')
              span.glyphicon.glyphicon-heart
            .meter.health
              .bar
                div(style='width:100%;') &nbsp;
          h2
            span.glyphicon.glyphicon-arrow-down
          .health-progress
            .meter-label(tooltip='Health')
              span.glyphicon.glyphicon-heart
            .meter.health
              .bar
                div(style='width:50%;') &nbsp;
        button.btn.btn-primary.btn-lg.fixedcta.gamifybutton(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#quest.container-fluid
      .row
        .col-6
          h2.headline {{ $t('questHeading1') }}
          h2 {{ $t('questHeading2') }}
          p.sectioninfo
            | {{ $t('questByline1') }}
            br
            | {{ $t('questByline2') }}
          .scrolltweet.hidden-xs.hidden-sm
            img.scrolltweet-image(data-toggle='tooltip', data-placement='top', title='skysailor', src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/testimonials/skysailor.png', alt="$t(altAttrSkysailor)")
            .tweet.popover.right.pull-right
              .arrow
              .popover-content
                | {{ $t('skysailorQuote') }}
        .col-6
          img.clearfix.img-responsive.center-block(style='padding-bottom:30px;', src="https://d2afqr2xdmyzvu.cloudfront.net/front/images/Quest_dilatory_dragonSmall.png", alt='')
          .row
            .col-lg-5.col-5.offset-0.col-xs-5.col-xs-offset-0
              .health-progress
                .meter-label(tooltip='Health')
                  span.glyphicon.glyphicon-heart
                .meter.health
                  .bar
                    div(style='width:20%;') &nbsp;
              .quest-friend-img
                img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/party/AnnaCosplay.png', alt='')
            .col-1.col-xs-1
              h2
                span.glyphicon.glyphicon-arrow-right
            .col-lg-5.col-offset-1.col-5.offset-0.col-xs-5.col-xs-offset-0
              .health-progress
                .meter-label(tooltip='Health')
                  span.glyphicon.glyphicon-heart
                .meter.health
                  .bar
                    div(style='width:0%;') &nbsp;
              .quest-friend-img
                img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/party/GrimReaper.png', alt='')
        .col-12
          button.btn.btn-primary.btn-lg.fixedcta.gamifybutton(@click='playButtonClick()') {{ $t('gamifyButton') }}
    section#features.bg-info.container-fluid
      .row
        h2.col-12.text-center {{ $t('featuresHeading') }}
      .row
        .col-6
          .feature-img
            img.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/Mount.png', alt='')
          .featuretext
            h4 {{ $t('featurePetHeading') }}
            p
              | {{ $t('featurePetByline') }}
        .col-6
          .feature-img.center-block
            img.img-rendering-auto(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/achievement-triadbingo.png', alt='')
            img.img-rendering-auto(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/achievement-perfect.png', alt='')
          .featuretext
            h4 {{ $t('featureAchievementHeading') }}
            p {{ $t('featureAchievementByline') }}
      .row
        .col-6
          .feature-img
            img.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/Promo_springclasses2015.png', alt='')
          .featuretext
            h4 {{ $t('featureEquipHeading') }}
            p
              | {{ $t('featureEquipByline') }}
        .col-6
          .feature-img
            img.img-rendering-auto.center-block.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/Party-Header.png', alt='')
          .featuretext
            h4 {{ $t('featureSocialHeading') }}
            p
              | {{ $t('featureSocialByline') }}
        button.btn.btn-primary.btn-lg.fixedcta.gamifybutton(@click='playButtonClick()') {{ $t('gamifyButton') }}
    #footercall.container-fluid
      .row
        h3.col-12.text-center {{ $t('joinOthers', {userCount}) }}
      .row
        .col-6.offset-3
          button.btn.btn-primary.btn-lg.btn-block(@click='playButtonClick()') {{ $t('free') }}
    footer.footer.container-fluid
      .shoutout
        h4 {{ $t('contribUse') }}
        .row
          .col-lg-2.col-2.col-offset-1.offset-1.col-xs-6.col-xs-offset-1
            a(href='http://ionicframework.com/')
              img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/ionic-logo-horizontal-transparent.png', alt="$t(altAttrIonic)")
          .col-lg-2.col-lg-offset-0.col-2.col-offset-0.offset-1.col-xs-6.col-xs-offset-1
            a(href='https://www.jetbrains.com/webstorm/')
              img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/logo_webstorm.png', alt="$t(altAttrWebstorm)")
          .col-lg-2.col-lg-offset-0.col-2.col-offset-0.offset-1.col-xs-6.col-xs-offset-1
            a(href='http://github.com/')
              img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/GitHub_Logo.png', alt="$t(altAttrGithub)")
          .col-lg-2.col-lg-offset-0.col-2.col-offset-0.offset-1.col-xs-6.col-xs-offset-1
            a(href='https://trello.com/')
              img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/trello-logo-blue.png', alt="$t(altAttrTrello)")
          .col-lg-2.col-lg-offset-0.col-2.col-offset-0.offset-1.col-xs-6.col-xs-offset-1
            a(href='https://slack.com/')
              img.img-rendering-auto.img-responsive(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/landing_slack_hash_wordmark_logo.png', alt="$t(altAttrSlack)")

      app-footer
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/static.scss';

  .logo {
    width: 128px;
    height: 28px;
    color: purple;
  }

  #intro {
    background: #fff;
    padding-top: 1em;
    padding-bottom: 1em;

    .cta {
      color: #fff;
      padding: 2em;
    }

    .presslogos {
      padding: 2em;

      img {
        max-height: 30px;
        max-width: 120px;
        filter: grayscale(100%);
        -moz-filter: grayscale(100%);
        -ms-filter: grayscale(100%);
        -o-filter: grayscale(100%);
        filter: gray;
        -webkit-filter: grayscale(100%);
        margin-right: 2em;
      }
    }

    .bg-success {
      background-color: #dff0d8 !important;
    }
  }

  #intro-text {
    .lead {
      padding: 2em;
    }
  }

  #testimonial-carousel {
    padding: 2em;
    background-color: #d9edf7 !important;

    h2 {
      margin-top: 2em;
      margin-bottom: 3em;
    }

    .item {
      display: none;
    }

    .item.active {
      display: block;
    }

    #quote-carousel {
      margin-top: 7em;

      .user-selector {
        margin-top: 2em;
      }

      .user-icon {
        display: inline-block;
        vertical-align: bottom;

        img {
          width: 80px;
        }
      }
    }
  }

  #uses {
    padding: 2em;
  }
</style>

<script>
  import AppFooter from 'client/components/appFooter';
  import StaticHeader from './header.vue';

  export default {
    components: {
      AppFooter,
      StaticHeader,
    },
    data () {
      return {
        userCount: 1000000,
      };
    },
    mounted () {
      // Analytics.track({"hitType":"pageview","eventCategory":"page","eventAction":"landing page","page":"/home"});
    },
    methods: {
      playButtonClick () {
        this.$router.push('/register');
      },
    },
  };
</script>
