<template lang="pug">
  .container-fluid
    .row
      .col-md-6.offset-3
        h1 {{ $t('contactUs') }}

        p
          | {{ $t('reportAccountProblems') }}
          | &colon;&nbsp;
          a(href='mailto:admin@habitica.com') admin&commat;habitica&period;com
          br
          | {{ $t('reportBug') }}
          | &colon;&nbsp;
          a(target='_blank', href='/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac') Report a Bug guild
          | &nbsp;or&nbsp;
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
          a(target='_blank', href='/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a') Habitica Help guild
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
