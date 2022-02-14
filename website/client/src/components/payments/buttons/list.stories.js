/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';

import PaymentsButtonsList from './list.vue';
import getStore from '@/store';
import { setup as setupPayments } from '@/libs/payments';

setupPayments();

storiesOf('Subscriptions/Payments Buttons', module)
  .add('simple', () => ({
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
  }))
  .add('disabled', () => ({
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
  }))
  .add('only stripe and amazon (example)', () => ({
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
  }));
