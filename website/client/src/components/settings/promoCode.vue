<template>
  <div class="row standard-page">
    <div class="col-md-6">
      <h2>{{ $t('promoCode') }}</h2>
      <div
        class="form-inline"
        role="form"
      >
        <input
          v-model="couponCode"
          class="form-control"
          type="text"
          :placeholder="$t('promoPlaceholder')"
        >
        <button
          class="btn btn-primary"
          @click="enterCoupon()"
        >
          {{ $t('submit') }}
        </button>
      </div>
      <div>
        <small>{{ $t('couponText') }}</small>
      </div>
      <div v-if="user.permissions.coupons">
        <hr>
        <h4>{{ $t('generateCodes') }}</h4>
        <div
          class="form"
          role="form"
        >
          <div class="form-group">
            <input
              v-model="codes.event"
              class="form-control"
              type="text"
              placeholder="Event code (eg, 'wondercon')"
            >
          </div>
          <div class="form-group">
            <input
              v-model="codes.count"
              class="form-control"
              type="number"
              placeholder="Number of codes to generate (eg, 250)"
            >
          </div>
          <div class="form-group">
            <button
              class="btn btn-primary"
              type="submit"
              @click="generateCodes(codes)"
            >
              {{ $t('generate') }}
            </button>
            <a
              class="btn btn-secondary"
              :href="getCodesUrl"
            >{{ $t('getCodes') }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';

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
    ...mapState({ user: 'user.data', credentials: 'credentials' }),
    getCodesUrl () {
      if (!this.user) return '';
      return '/api/v4/coupons';
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('promoCode'),
    });
  },
  methods: {
    generateCodes () {
      // $http.post(ApiUrl.get() + '/api/v2/coupons/generate/
      // '+codes.event+'?count='+(codes.count || 1))
      //   .success(function(res,code){
      //     $scope._codes = {};
      //     if (code!==200) return;
      //     window.location.href = '/api/v2/coupons?limit='+codes.count+'&_id='+User.user._id+
      // '&apiToken='+User.settings.auth.apiToken;
      //   })
    },
    async enterCoupon () {
      const code = await axios.post(`/api/v4/coupons/enter/${this.couponCode}`);
      if (!code) return;

      this.$store.state.user.data = code.data.data;

      this.text(this.$t('promoCodeApplied'));
    },
  },
};
</script>
