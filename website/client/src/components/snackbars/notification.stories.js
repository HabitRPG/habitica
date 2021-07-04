/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { boolean, number, withKnobs } from '@storybook/addon-knobs';

import Notification from './notification';
import Notifications from './notifications';
import notificationsMixin from '../../mixins/notifications';

const stories = storiesOf('Notifications', module);

stories.addDecorator(withKnobs);

stories
  .add('notifications overview', () => ({
    components: {
      Notification,
    },
    template: `
      <div style="position: absolute; margin: 20px">
        <div style="display: flex; flex-wrap: wrap; align-items: flex-start">
          <Notification v-for="notification of notifications"
                        :notification="notification"
                        :style="{outline: showBounds ? '1px solid green': ''}">
            
          </Notification> <br/>
        </div>
      </div>
    `,
    data () {
      const notifications = [];

      notifications.push({
        type: 'hp',
        sign: '+',
        text: '2',
      });

      notifications.push({
        type: 'hp',
        sign: '-',
        text: '2',
      });

      notifications.push({
        type: 'mp',
        sign: '-',
        text: '2',
      });

      notifications.push({
        type: 'xp',
        sign: '+',
        text: '12',
      });

      notifications.push({
        type: 'gp',
        sign: '+',
        text: '12',
      });

      notifications.push({
        type: 'streak',
        text: '12',
      });


      notifications.push({
        type: 'damage',
        sign: '+',
        text: '12',
      });

      notifications.push({
        type: 'drop',
        icon: 'shop_weapon_wizard_2',
        text: 'Dropped',
      });

      notifications.push({
        type: 'info',
        text: 'Info',
      });

      notifications.push({
        type: 'success',
        text: 'Success!',
      });
      notifications.push({
        type: 'crit',
        text: 'Crit!',
      });
      notifications.push({
        type: 'lvl',
        text: 'Lvl Up',
      });

      notifications.push({
        type: 'error',
        text: 'ERR',
      });

      return {
        notifications,
      };
    },
    props: {
      showBounds: {
        default: boolean('show bounds', false),
      },
    },
  }))
  .add('trigger notifications', () => ({
    components: {
      Notifications,
    },
    template: `
      <div style="position: absolute; margin: 20px">
        <button @click="addNotification()">Add Notifications</button>
      
        <Notifications :prevent-queue="preventQueue"
                       :delay-delete-and-new="delayBetweenDeleteAndNew"
                       :debug-mode="debugMode"
                       :style="{outline: showBounds ? '1px solid green': ''}">
        </Notifications>
      </div>
    `,
    props: {
      showBounds: {
        default: boolean('show bounds', false),
      },
      preventQueue: {
        default: boolean('prevent removing', false),
      },
      delayBetweenDeleteAndNew: {
        default: number('delay between delete and new', 60),
      },
      debugMode: {
        default: boolean('debug mode', true),
      },
    },
    data () {
      return {};
    },
    mixins: [notificationsMixin],
    methods: {
      addNotification () {
        this.text('notification!!');
        this.exp(125);
        this.damage(-2);
      },
    },
  }));
