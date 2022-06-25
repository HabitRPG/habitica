import PaymentsButtonsList from './list.vue';
import getStore from '@/store';
import { setup as setupPayments } from '@/libs/payments';

setupPayments();

export default {
  title: 'Subscriptions/Payments Buttons',
};

export const Simple = () => ({
  components: { PaymentsButtonsList },
  template: `
      <div style="position: absolute; margin: 20px">
        <payments-buttons-list
          :amazon-data="{type: 'single'}"
          :stripe-fn="() => {}"
          :paypal-fn="() => {}"
        ></payments-buttons-list>
      </div>
    `,
  store: getStore(),
});

Simple.story = {
  name: 'simple',
};

export const Disabled = () => ({
  components: { PaymentsButtonsList },
  template: `
      <div style="position: absolute; margin: 20px">
        <payments-buttons-list
          :disabled="true"
          :amazon-data="{type: 'single'}"
          :stripe-fn="() => {}"
          :paypal-fn="() => {}"
        ></payments-buttons-list>
      </div>
    `,
  store: getStore(),
});

Disabled.story = {
  name: 'disabled',
};

export const OnlyStripeAndAmazonExample = () => ({
  components: { PaymentsButtonsList },
  template: `
      <div style="position: absolute; margin: 20px">
        <payments-buttons-list
          :amazon-data="{type: 'single'}"
          :stripe-fn="() => {}"
        ></payments-buttons-list>
      </div>
    `,
  store: getStore(),
});

OnlyStripeAndAmazonExample.story = {
  name: 'only stripe and amazon (example)',
};
