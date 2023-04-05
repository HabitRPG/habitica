<template>
  <div class="container-fluid">
    <h1>{{ $t('presskit') }}</h1>
    <p>{{ $t('presskitText', { pressEnquiryEmail : PRESS_ENQUIRY_EMAIL }) }}</p>
    <p>
      <a
        class="btn btn-lg btn-success"
        href="/static/presskit/presskit.zip"
      >presskit.zip</a>
    </p>
    <div
      v-for="(images, category) in imgs"
      :key="category"
    >
      <h2>{{ $t(`pk${category}`) }}</h2>
      <div v-if="Array.isArray(images)">
        <div
          v-for="img in images"
          :key="img"
        >
          <img
            class="img-fluid img-rendering-auto press-img"
            :src="`/static/presskit/${category}/${img}`"
          >
        </div>
      </div>
      <div v-else>
        <div
          v-for="(images, secondaryCategory) in images"
          :key="secondaryCategory"
        >
          <h3>{{ $t(`pk${secondaryCategory}`) }}</h3>
          <div
            v-for="img in images"
            :key="img"
          >
            <img
              class="img-fluid img-rendering-auto press-img"
              :src="`/static/presskit/${category}/${secondaryCategory}/${img}`"
            >
          </div>
        </div>
      </div>
    </div>
    <h1>{{ $t('FAQ') }}</h1>
    <div
      id="faq"
      role="tablist"
    >
      <div
        v-for="(QA, index) in faq"
        :key="index"
        class="faq-question"
      >
        <h2
          v-b-toggle="QA.question"
          tabindex="0"
          role="button"
          v-html="$t(QA.question)"
        ></h2>
        <b-collapse
          :id="QA.question"
          accordion="pkAccordian"
          role="tabpanel"
        >
          <p v-html="$t(QA.answer)"></p>
        </b-collapse>
      </div>
    </div>
    <p>{{ $t('pkMoreQuestions') }}</p>
  </div>
</template>

<style lang="scss" scoped>
  .faq-question {
    cursor: pointer;
  }
</style>

<script>
// @TODO: EMAILS.PRESS_ENQUIRY_EMAIL
const PRESS_ENQUIRY_EMAIL = 'admin@habitica.com';

export default {
  data () {
    return Object.freeze({
      PRESS_ENQUIRY_EMAIL,
      imgs: {
        Promo: [
          'Promo.png',
          'Promo - Thin.png',
        ],
        Logo: [
          'Icon with Text.png',
          'Icon.png',
          'Text.png',
          'Habitica Gryphon.png',
          'iOS.png',
          'Android.png',
        ],
        Boss: [
          'Basi-List.png',
          'Stagnant Dishes.png',
          'SnackLess Monster.png',
          'Laundromancer.png',
          'Necro-Vice.png',
          'Battling the Ghost Stag.png',
          'Dread Drag\'on of Dilatory.png',
        ],
        Samples: {
          Website: [
            'CheckInIncentives.png',
            'Inventory.png',
            'Equipment.png',
            'Market.png',
            'Market2.png',
            'Tavern.png',
            'Guilds.png',
            'Challenges.png',
          ],
          iOS: [
            'Tasks Page.png',
            'Level Up.png',
            'Market.png',
            'Party.png',
            'Boss.png',
          ],
          Android: [
            'Login.png',
            'User.png',
            'Tasks Page.png',
            'Add Tasks.png',
            'Stats.png',
            'Shops.png',
            'Party.png',
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
      ],
    });
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('presskit'),
    });
  },
};
</script>
