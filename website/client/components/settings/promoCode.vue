<template lang="pug">
.row.standard-page
  .col-md-6
    h2 {{ $t('promoCode') }}
    .form-inline(role='form')
      input.form-control(type='text', v-model='couponCode', :placeholder="$t('promoPlaceholder')")
      button.btn.btn-primary(@click='enterCoupon()') {{ $t('submit') }}
    div
      small {{ $t('couponText') }}
    div(v-if='user.contributor.sudo')
      hr
      h4 {{ $t('generateCodes') }}
      .form(role='form')
        .form-group
          input.form-control(type='text', v-model='codes.event', placeholder="Event code (eg, 'wondercon')")
        .form-group
          input.form-control(type='number', v-model='codes.count', placeholder="Number of codes to generate (eg, 250)")
        .form-group
          button.btn.btn-primary(type='submit', @click='generateCodes(codes)') {{ $t('generate') }}
          a.btn.btn-secondary(:href='getCodesUrl') {{ $t('getCodes') }}
</template>

<script>
import axios from 'axios';
import { mapState } from 'client/libs/store';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  data () {
    return {
      codes: {
        event: '',
        count: '',
      },
      couponCode: '',
    };
  },
  computed: {
    ...mapState({user: 'user.data', credentials: 'credentials'}),
    getCodesUrl () {
      if (!this.user) return '';
      return `/api/v3/coupons?_id=${this.user._id}&apiToken=${this.credentials.API_TOKEN}`;
    },
  },
  methods: {
    generateCodes () {
      // $http.post(ApiUrl.get() + '/api/v2/coupons/generate/'+codes.event+'?count='+(codes.count || 1))
      //   .success(function(res,code){
      //     $scope._codes = {};
      //     if (code!==200) return;
      //     window.location.href = '/api/v2/coupons?limit='+codes.count+'&_id='+User.user._id+'&apiToken='+User.settings.auth.apiToken;
      //   })
    },
    async enterCoupon () {
      let code = await axios.post(`/api/v3/coupons/enter/${this.couponCode}`);
      if (!code) return;

      this.$store.state.user.data = code.data.data;

      this.text(this.$t('promoCodeApplied'));
    },
  },
};
</script>
