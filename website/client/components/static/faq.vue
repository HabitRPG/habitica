<template lang="pug">
.row
  .col-6.offset-3
    .page-header
      h1 {{ $t('frequentlyAskedQuestions') }}
    p.pagemeta
      | {{ $t('lastUpdated') }}
      |&nbsp;
      | {{ $t('January') }}
      |&nbsp;5&comma; 2016
    div(v-for='(heading, index) in headings')
      h2.accordion(@click='setActivePage(heading)') {{ $t(`faqQuestion${index}`) }}
      div(v-if='activePage === heading', v-markdown="$t('webFaqAnswer' + index, replacements)")
    hr
    div(v-markdown="$t('webFaqStillNeedHelp')")
</template>

<script>
// @TODO:  env.EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';
import markdownDirective from 'client/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      activePage: '',
      headings: ['overview', 'set-up-tasks', 'sample-tasks', 'task-color', 'health', 'party-with-friends', 'pets-mounts', 'character-classes', 'blue-mana-bar', 'monsters-quests', 'gems', 'bugs-features', 'world-boss'],
      replacements: {
        techAssistanceEmail: TECH_ASSISTANCE_EMAIL,
        wikiTechAssistanceEmail: `mailto:${TECH_ASSISTANCE_EMAIL}`,
      },
    };
  },
  methods: {
    setActivePage (page) {
      this.activePage = page;
    },
  },
};
</script>
