import Subscription from './subscription.vue';
import { mockStore } from '../../../config/storybook/mock.data';

export default {
  title: 'Subscriptions/Detail Page',
};

export const Subscribed = () => ({
  components: { Subscription },
  template: `
      <div style="position: absolute; margin: 20px">
        <subscription ></subscription>
      </div>
    `,
  data () {
    return {};
  },
  store: mockStore({
    userData: {
      purchased: {
        plan: {
          customerId: 'customer-id',
          planId: 'plan-id',
          subscriptionId: 'sub-id',
          gemsBought: 22,
          dateUpdated: new Date(2021, 0, 15),
          consecutive: {
            count: 2,
            gemCapExtra: 4,
            offset: 2,
          },
        },
      },
    },
  }),
});

Subscribed.story = {
  name: 'subscribed',
};
