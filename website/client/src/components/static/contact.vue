<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6 offset-3">
        <h1>{{ $t('contactUs') }}</h1>
        <p>
          {{ $t('reportAccountProblems') }}
          &colon;&nbsp;
          <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
          <span v-if="user">
            <br>
            <a
              target="_blank"
              @click.prevent="openBugReportModal()"
            >
              {{ $t('reportBug') }}
            </a>
            <br>
            {{ $t('reportCommunityIssues') }}
            &colon;&nbsp;
            <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
          </span>
          <span v-else>
            <br>
            {{ $t('reportBug') }}
            &colon;&nbsp;
            <a href="mailto:admin@habitica.com">admin&commat;habitica&period;com</a>
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
            @click.prevent="openBugReportModal(true)"
          > {{ $t('askQuestion') }}</a>
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
import reportBug from '@/mixins/reportBug.js';

export default {
  mixins: [reportBug],
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('contactUs'),
    });
  },
  methods: {
    modForm () {
      goToModForm(this.user);
    },
  },
};
</script>
