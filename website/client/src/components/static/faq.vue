<template>
  <div
    class="container-fluid"
    role="tablist"
  >
    <div class="row">
      <div class="col-12 col-md-6 offset-md-3">
        <h1 id="faq-heading">
          {{ $t('frequentlyAskedQuestions') }}
        </h1>
        <div
          v-for="(heading, index) in headings"
          :key="index"
          class="faq-question"
        >
          <h2
            v-b-toggle="heading"
            role="tab"
            variant="info"
            @click="handleClick($event)"
          >
            {{ $t(`faqQuestion${index}`) }}
          </h2>
          <b-collapse
            :id="heading"
            :visible="isVisible(heading)"
            accordion="faq"
            role="tabpanel"
          >
            <div
              v-markdown="$t('webFaqAnswer' + index, replacements)"
              class="card-body"
            ></div>
          </b-collapse>
        </div>
        <hr>
        <p v-markdown="$t('webFaqStillNeedHelp')"></p>
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
// @TODO:  env.EMAILS.TECH_ASSISTANCE_EMAIL
import markdownDirective from '@/directives/markdown';

const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    const headings = [
      'overview',
      'set-up-tasks',
      'sample-tasks',
      'task-color',
      'health',
      'party-with-friends',
      'pets-mounts',
      'character-classes',
      'blue-mana-bar',
      'monsters-quests',
      'gems',
      'bugs-features',
      'world-boss',
    ];

    const hash = window.location.hash.replace('#', '');

    return {
      headings,
      replacements: {
        techAssistanceEmail: TECH_ASSISTANCE_EMAIL,
        wikiTechAssistanceEmail: `mailto:${TECH_ASSISTANCE_EMAIL}`,
      },
      visible: hash && headings.includes(hash) ? hash : null,
      // @TODO webFaqStillNeedHelp: {
      // linkStart: '[',
      // linkEnd: '](/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a)',
      // },
      // "webFaqStillNeedHelp": "If you have a question that isn't on this list or on the [Wiki FAQ](http://habitica.fandom.com/wiki/FAQ), come ask in the <%= linkStart %>Habitica Help guild<%= linkEnd %>! We're happy to help."
    };
  },
  methods: {
    isVisible (heading) {
      return this.visible && this.visible === heading;
    },
    handleClick (e) {
      if (!e) return;
      const heading = e.target.nextElementSibling.id;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
