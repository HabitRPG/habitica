<template>
  <div class="row standard-page">
    <div class="col-12">
      <h1
        v-once
        class="page-header"
      >
        {{ $t('promoCode') }}
      </h1>

      <div class="input-area">
        <div
          class="form-inline"
          role="form"
        >
          <input
            v-model="couponCode"
            class="form-control w-100"
            type="text"
            :placeholder="$t('promoPlaceholder')"
          >
        </div>
        <div
          v-once
          class="small mt-2"
        >
          {{ $t('couponText') }}
        </div>
        <save-cancel-buttons
          :hide-cancel="true"
          primary-button-label="submit"
          @saveClicked="enterCoupon()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';
import SaveCancelButtons from '@/pages/settings/components/saveCancelButtons.vue';

export default {
  components: { SaveCancelButtons },
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
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('settings'),
      subSection: this.$t('promoCode'),
    });
  },
  methods: {
    async enterCoupon () {
      const code = await axios.post(`/api/v4/coupons/enter/${this.couponCode}`);
      if (!code) return;

      this.$store.state.user.data = code.data.data;

      this.text(this.$t('promoCodeApplied'));
    },
  },
};
</script>
