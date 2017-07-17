<template lang="pug">
  .row
    .col-md-12
      .page-header
        h1 {{ $t('contactUs') }}
      p
        | {{ $t('reportAccountProblems') }}
        | &colon;&nbsp;
        a(href='mailto:admin@habitica.com') admin&commat;habitica&period;com
        br
        | {{ $t('reportBug') }}
        | &colon;&nbsp;
        a(target='_blank', href='https://github.com/HabitRPG/habitica/issues?q=is%3Aopen') GitHub
        br
        | {{ $t('reportCommunityIssues') }}
        | &colon;&nbsp;
        a(href='mailto:leslie@habitica.com') leslie&commat;habitica&period;com
        br
        | {{ $t('subscriptionPaymentIssues') }}
        | &colon;&nbsp;
        a(href='mailto:admin@habitica.com') admin&commat;habitica&period;com
        br
        | {{ $t('generalQuestionsSite') }}
        | &colon;&nbsp;
        a(target='_blank', href='http://habitica.wikia.com/wiki/The_Keep:Habitica_Help:_Ask_a_Question') Habitica Help guild
        br
        | {{ $t('businessInquiries') }}
        | &colon;&nbsp;
        a(href='mailto:vicky@habitica.com') vicky&commat;habitica&period;com
        br
        | {{ $t('merchandiseInquiries') }}
        | &colon;&nbsp;
        a(href='mailto:store@habitica.com') store&commat;habitica&period;com
        br
        | {{ $t('marketingInquiries') }}
        | &colon;&nbsp;
        a(href='mailto:leslie@habitica.com') leslie&commat;habitica&period;com
</template>
