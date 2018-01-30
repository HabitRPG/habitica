import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'JANUARY SUBSCRIBER ITEMS, RESOLUTION PLOT-LINE, AND GUILDS FOR GOALS';
const worldDmg = { // @TODO
  bailey: false,
};

/**
 * @api {get} /api/v3/news Get latest Bailey announcement
 * @apiName GetNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} html Latest Bailey html
 *
 */
api.getNews = {
  method: 'GET',
  url: '/news',
  async handler (req, res) {
    const baileyClass = worldDmg.bailey ? 'npc_bailey_broken' : 'npc_bailey';

    res.status(200).send({
      html: `
      <div class="bailey">
        <div class="media">
            <div class="align-self-center mr-3 ${baileyClass}"></div>
            <div class="media-body">
                <h1 class="align-self-center">${res.t('newStuff')}</h1>
            </div>
        </div>
        <h2>1/23/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>

        <h3>January Subscriber Items Revealed!</h3>
        <p class="markdown">The January Subscriber Item has been revealed: the Frost Sprite Item Set! You only have until January 31 to receive the item set when you
         <a href="/settings/subscription" target="_blank">subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory &gt; 
         Equipment to claim your gear!</p>
        <p>Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! 
        There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. 
        Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small">by Beffymaroo</div>

        <div class="promo_mystery_201801 center-block"></div>

        <h3>Resolution Plot-Line: An Overheard Conversation</h3>
        <p>As you stride through the streets of Habit City, you overhear a worried conference of whispers. Curious, you peek in to Productivity Plaza and discover Lemoness and Beffymaroo in solemn conversation.</p>
        <p>"On one hand, there's always the risk of discouragement when the eagerness of a fresh New Year's resolution gives way to everyday difficulties," Lemoness is saying. "But that just doesn't seem to match these reports. 
        Habiticans who were making real progress are abruptly giving up all their goals overnight."</p>
        <p>"I agree," says Beffymaroo. "And look at these maps -- all the reports are happening in the exact same neighborhoods."</p>

        <p>"Clustered discouragement, cropping up all over the city?" Lemoness shakes her head. "I won't tempt fate by calling it a coincidence. It's time to investigate."</p>
        <p>Without further ado, both of them hurry away. What a strange conversation to overhear! Perhaps we'll learn more about this later....</p>

        <div class="media">
          <div class="media-body">
            <h3>New Goals for the New Year: Guilds for Setting (and Keeping) Realistic Goals</h3>
            <p class="markdown">
            <p>There's a new <a href="https://habitica.wordpress.com/2018/01/23/new-goals-for-the-new-year-guilds-for-setting-and-keeping-realistic-goals/" target="_blank">Guild Spotlight on the blog</a> that highlights the Guilds that can help you as set new goals for 2018 and strive to stay on track! Check it out now to find Habitica's best goal-setting communities.</p>
            </p>
            <div class="small">by Beffymaroo</div>
          </div>
          <div class="scene_task_list left-margin"></div>
        </div>
        <hr>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Get latest Bailey announcement in a second moment
 * @apiName TellMeLaterNews
 * @apiGroup News
 *
 *
 * @apiSuccess {Object} data An empty Object
 *
 */
api.tellMeLaterNews = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const user = res.locals.user;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => {
      return n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;