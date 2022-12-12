<template>
  <div
    class="container-fluid"
    role="tablist"
  >
    <div class="row">
      <div class="col-12 col-md-6 offset-md-3">
        <h1
          v-once
          id="faq-heading"
        >
          {{ $t('frequentlyAskedQuestions') }}
        </h1>
        <div
          v-for="(entry, index) in faq.questions"
          :key="index"
          class="faq-question"
        >
          <h2
            v-once
            v-b-toggle="entry.heading"
            role="tab"
            variant="info"
            @click="handleClick($event)"
          >
            {{ entry.question }}
          </h2>
          <b-collapse
            :id="entry.heading"
            :visible="isVisible(entry.heading)"
            accordion="faq"
            role="tabpanel"
          >
            <div
              v-once
              v-markdown="entry.web"
              class="card-body"
            ></div>
          </b-collapse>
        </div>
        <hr>
        <p
          v-once
          v-markdown="stillNeedHelp"
        ></p>
      </div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  .card-body {
    margin-bottom: 1em;
  }

  .faq-question h2 {
    cursor: pointer;
  }

  .faq-question .card-body {
    padding: 0;
  }

  .static-wrapper .faq-question h2 {
    margin: 0 0 16px 0;
  }

  .faq-question a {
    text-decoration: none;
    color: #4F2A93;
  }

  @media only screen and (max-width: 768px) {
    .container-fluid {
      margin: auto;
    }
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      faq: {},
      headings: [],
      stillNeedHelp: '',
    };
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('help'),
      subSection: this.$t('faq'),
    });
    this.faq = await this.$store.dispatch('faq:getFAQ');
    for (const entry of this.faq.questions) {
      this.headings.push(entry.heading);
    }
    this.stillNeedHelp = this.faq.stillNeedHelp.web;
  },
  methods: {
    isVisible (heading) {
      const hash = window.location.hash.replace('#', '');
      return hash && this.headings.includes(hash) && hash === heading;
    },
    handleClick (e) {
      if (!e) return;
      const heading = e.target.nextElementSibling.id;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
