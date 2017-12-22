<template lang="pug">
  .container-fluid
    .row
      .col-12.col-md-6.offset-md-3
        h1 {{ $t('frequentlyAskedQuestions') }}
        .faq-question(v-for='(heading, index) in headings')
          h2.accordion(@click='setActivePage(heading)') {{ $t(`faqQuestion${index}`) }}
          div(v-if='pageState[heading]', v-markdown="$t('webFaqAnswer' + index, replacements)")
        hr
        p(v-markdown="$t('webFaqStillNeedHelp')")
</template>

<style lang='scss' scoped>
  .faq-question {
    margin-bottom: 1em;
  }

  @media only screen and (max-width: 768px) {
    .container-fluid {
      margin: auto;
    }
  }
</style>

<script>
  // @TODO:  env.EMAILS.TECH_ASSISTANCE_EMAIL
  const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';
  import markdownDirective from 'client/directives/markdown';

  export default {
    directives: {
      markdown: markdownDirective,
    },
    data () {
      let headings = [
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

      let pageState = {};
      for (let index in headings) {
        let heading = headings[index];
        pageState[heading] = false;
      }

      return  {
        pageState,
        headings,
        replacements: {
          techAssistanceEmail: TECH_ASSISTANCE_EMAIL,
          wikiTechAssistanceEmail: `mailto:${TECH_ASSISTANCE_EMAIL}`,
        },
        // @TODO webFaqStillNeedHelp: {
          // linkStart: '[',
          // linkEnd: '](/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a)',
        // },
        // "webFaqStillNeedHelp": "If you have a question that isn't on this list or on the [Wiki FAQ](http://habitica.wikia.com/wiki/FAQ), come ask in the <%= linkStart %>Habitica Help guild<%= linkEnd %>! We're happy to help."
      };
    },
    methods: {
      setActivePage (page) {
        this.pageState[page] = !this.pageState[page];
      },
    },
  };
</script>
