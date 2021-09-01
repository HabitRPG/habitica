/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { boolean, withKnobs } from '@storybook/addon-knobs';

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
                        :style="{outline: showBounds ? '1px solid green': ''}"
                        style="margin-right: 1rem">
            
          </Notification> <br/>
        </div>
      </div>
    `,

    data () {
      const notifications = [];

      notifications.push({
        type: 'hp',
        sign: '+',
        text: '+2',
      });

      notifications.push({
        type: 'hp',
        sign: '-',
        text: '-2',
      });

      notifications.push({
        type: 'mp',
        sign: '+',
        text: '+2',
      });

      notifications.push({
        type: 'mp',
        sign: '-',
        text: '-2',
      });

      notifications.push({
        type: 'xp',
        sign: '+',
        text: '+12',
      });

      notifications.push({
        type: 'xp',
        sign: '-',
        text: '-12',
      });

      notifications.push({
        type: 'gp',
        sign: '+',
        text: '+12',
      });

      notifications.push({
        type: 'gp',
        sign: '-',
        text: '-12',
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
        text: 'Dropped something with a longer text to try',
      });

      notifications.push({
        type: 'drop',
        icon: 'Pet_Egg_FlyingPig',
        text: 'Dropped flying pig egg',
      });

      notifications.push({
        type: 'drop',
        icon: 'Pet_Food_Strawberry',
        text: 'You’ve found a Strawberry!',
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
        text: 'This is an error message. If it is too long, we can wrap to show the rest of the message',
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
        
         <button @click="crit(1337)">Crit</button>
        
         <button @click="drop('Drop', {type:'weapon', key: 'wizard_2'})">Drop</button>
        
         <button @click="quest('quest', 'val')">Quest</button> 
        <button @click="damage(-13)">Damage</button>
        <button @click="exp(42)">Exp</button> 
        <button @click="error('some error')">Error</button>
      
        <br/>
        
        <button @click="gp(23, 0)">Gold</button>
        
        
        <button @click="hp(23)">HP</button>
        <button @click="mp(23)">MP</button>
        
        <button @click="lvl()">LVL</button>
        
        <button @click="streak('Streak')">Streak</button>
      
        <br/>
        <button @click="markdown('You cast a skill')">Markdown</button>
        
        
        <Notifications :prevent-queue="preventQueue"
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
        this.text('notification2!!');
        this.text('notification3!!');
        this.error('This should stay visible');
        this.text('notification4!!');
        this.exp(125);
        this.damage(-2);

        this.error('This should stay visible too');
        this.text('notification5!!');
        this.exp(125);
        this.damage(-2);
      },
    },
  }));
