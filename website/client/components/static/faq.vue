<template lang='pug'>
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
      a.h2.accordion.collapsed(:href="`#${heading}`", data-toggle='collapse') {{ $t(`faqQuestion${index}`) }}
      .clearfix.collapse(id=heading)
        //!=md.unsafeHTMLRender(env.t('webFaqAnswer' + index, replacements))

    hr
    //h3!=md.unsafeHTMLRender(env.t('webFaqStillNeedHelp'))
</template>

<script>
// @TODO:  env.EMAILS.TECH_ASSISTANCE_EMAIL
const TECH_ASSISTANCE_EMAIL = 'admin@habitica.com';

export default {
  data () {
    return {
      headings: ['overview', 'set-up-tasks', 'sample-tasks', 'task-color', 'health', 'party-with-friends', 'pets-mounts', 'character-classes', 'blue-mana-bar', 'monsters-quests', 'gems', 'bugs-features', 'world-boss'],
      replacements: {
        techAssistanceEmail: TECH_ASSISTANCE_EMAIL,
        wikiTechAssistanceEmail: `mailto:${TECH_ASSISTANCE_EMAIL}`,
      },
    };
  },
};
</script>
