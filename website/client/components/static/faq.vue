<template lang="pug">
.row
  .col-md-12
    .page-header
      h1 {{ $t('frequentlyAskedQuestions') }}
    p.pagemeta
      | {{ $t('lastUpdated') }}
      |&nbsp;
      | {{ $t('January') }}
      |&nbsp;5&comma; 2016
    div(v-for='(heading, index) in headings')
      strong.accordion(@click='setActivePage(heading)') {{ $t(`faqQuestion${index}`) }}
      // @TODO: Markdown
      div(v-if='activePage === heading', v-html="$t('webFaqAnswer' + index, replacements)")

    hr
    // @TODO markdown
    div(v-html="$t('webFaqStillNeedHelp')")
</template>

<script>
// @TODO:  env.EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
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
