<template lang="pug">
  .container-fluid
    h1 {{ $t('presskit') }}
    p {{ $t('presskitText', { pressEnquiryEmail : PRESS_ENQUIRY_EMAIL }) }}
    p
      a.btn.btn-lg.btn-success(href='/static/presskit/presskit.zip') presskit.zip

    div(v-for='(images, category) in imgs')
      h2 {{ $t('pk' + category) }}
      div(v-if='Array.isArray(images)')
        div(v-for='img in images')
          img.img-fluid.img-rendering-auto.press-img(:src="`/static/presskit/${category}/${img}.png`")
      div(v-else)
        div(v-for='(images, secondaryCategory) in images')
          h3 {{ $t('pk' + secondaryCategory) }}
          div(v-for='img in images')
            img.img-fluid.img-rendering-auto.press-img(:src="`/static/presskit/${category}/${secondaryCategory}/${img}.png`")

    h1 {{ $t('FAQ') }}
    
    #faq(role='tablist')
      div(v-for='(QA, index) in faq')
        h2(v-b-toggle="QA.question", tabindex="0", role="button", v-html="$t(QA.question)")
        b-collapse(:id="QA.question", accordion="pkAccordian", role="tabpanel")
          p(v-html="$t(QA.answer)")
    
    p {{ $t('pkMoreQuestions') }}
</template>

<script>
  import bCollapse from 'bootstrap-vue/lib/components/collapse';
  import bToggle from 'bootstrap-vue/lib/directives/toggle';
  // @TODO: EMAILS.PRESS_ENQUIRY_EMAIL
  const PRESS_ENQUIRY_EMAIL = 'admin@habitica.com';

  export default {
    data () {
      return {
        PRESS_ENQUIRY_EMAIL,
        imgs: {
          Promo: [
            'Promo',
            'Promo - Thin',
          ],
          Logo: [
            'Icon with Text',
            'Habitica Gryphon',
            'iOS',
            'Android',
          ],
          Boss: [
            'Basi-List',
            'Stagnant Dishes',
            'SnackLess Monster',
            'Laundromancer',
            'Necro-Vice',
            'Battling the Ghost Stag',
            'Dread Drag\'on of Dilatory',
          ],
          Samples: {
            Website: [
              'Tasks Page',
              'Equipment',
              'Market',
              'Guilds',
              'Challenges',
            ],
            iOS: [
              'Tasks Page',
              'Level Up',
              'Pets',
              'Party',
              'Boss',
            ],
            Android: [
              'User',
              'Tasks Page',
              'Reward',
              'Level Up',
              'Tavern',
              'Party',
            ],
          },
        },
        faq: [
          {
            question: 'pkQuestion1',
            answer: 'pkAnswer1',
          },
          {
            question: 'pkQuestion2',
            answer: 'pkAnswer2',
          },
          {
            question: 'pkQuestion3',
            answer: 'pkAnswer3',
          },
          {
            question: 'pkQuestion4',
            answer: 'pkAnswer4',
          },
          {
            question: 'pkQuestion5',
            answer: 'pkAnswer5',
          },
          {
            question: 'pkQuestion6',
            answer: 'pkAnswer6',
          },
          {
            question: 'pkQuestion7',
            answer: 'pkAnswer7',
          },
          {
            question: 'pkQuestion8',
            answer: 'pkAnswer8',
          },
        ],
      };
    },
    components: {
      bCollapse,
    },
    directives: {
      bToggle,
    },
  };
</script>
