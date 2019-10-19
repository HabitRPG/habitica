<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 offset-3">
        <h1>{{ $t('contactUs') }}</h1>
        <p>
          {{ $t('reportAccountProblems') }}
          &colon;&nbsp;
          <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
          <br>
          {{ $t('reportBug') }}
          &colon;&nbsp;
          <a
            target="_blank"
            href="/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac"
          >Report a Bug guild</a>&nbsp;or&nbsp;
          <a
            target="_blank"
            href="https://github.com/HabitRPG/habitica/issues?q=is%3Aopen"
          >GitHub</a>
          <span v-if="user">
            <br>
            {{ $t('reportCommunityIssues') }}
            &colon;&nbsp;
            <a
              href
              @click.prevent="modForm()"
            >{{ $t('contactForm') }}</a>
          </span>
          <br>
          {{ $t('subscriptionPaymentIssues') }}
          &colon;&nbsp;
          <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
          <br>
          {{ $t('generalQuestionsSite') }}
          &colon;&nbsp;
          <a
            target="_blank"
            href="/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a"
          >Habitica Help guild</a>
          <br>
          {{ $t('businessInquiries') }}
          &colon;&nbsp;
          <a href="mailto:admin@habitica.com">admin@habitica.com</a>
          <br>
          {{ $t('merchandiseInquiries') }}
          &colon;&nbsp;
          <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from '@/libs/store';
import { goToModForm } from '@/libs/modform';

export default {
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  methods: {
    modForm () {
      goToModForm(this.user);
    },
  },
};
</script>
