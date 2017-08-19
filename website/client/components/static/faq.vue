<template lang="pug">
.row
  .col-6.offset-3
    .page-header
      h1 {{ $t('frequentlyAskedQuestions') }}
    .faq-question(v-for='(heading, index) in headings')
      h2.accordion(@click='setActivePage(heading)') {{ $t(`faqQuestion${index}`) }}
      div(v-if='pageState[heading]', v-markdown="$t('webFaqAnswer' + index, replacements)")
    hr
    div(v-markdown="$t('webFaqStillNeedHelp')")
</template>

<style scoped>
  .faq-question {
    margin-bottom: 1em;
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

    return {
      pageState,
      headings,
      replacements: {
        techAssistanceEmail: TECH_ASSISTANCE_EMAIL,
        wikiTechAssistanceEmail: `mailto:${TECH_ASSISTANCE_EMAIL}`,
      },
    };
  },
  methods: {
    setActivePage (page) {
      this.pageState[page] = !this.pageState[page];
    },
  },
};
</script>
