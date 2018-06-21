import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'JUNE SUBSCRIBER ITEMS AND HABIT HISTORY CHANGES';
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
        <h2>6/21/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>June Subscriber Items Revealed!</h3>
            <p>The June Subscriber Item Set has been revealed: the Alluring Anglerfish Item Set! You only have until June 30 to receive the item set when you <a href='/user/settings/subscription' target='_blank'>subscribe</a>. If you're already an active subscriber, reload the site and then head to Inventory > Items to claim your gear!</p>
          </div>
          <div class="promo_mystery_201806"></div>
        </div>
        <p>Subscribers also receive the ability to buy Gems for Gold -- the longer you subscribe, the more Gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <h3>Habit History Changes</h3>
        <p>In a few days we're making a change to the way Habit history is stored in order to improve overall site performance and reduce errors and bugs for folks with lots of task activity.</p>
        <p>If you view Habit history in a tool such as the <a href='https://oldgods.net/habitrpg/habitrpg_user_data_display.html' target='_blank'>Data Display Tool</a> you will no longer be able to see timestamps showing when you clicked a Habit. You will still see how many times you clicked it in a given day.</p>
        <p>So, if you are using your Habits for any tasks where the timestamps are critical, just a heads-up and a note to save your data elsewhere as timestamp data will be lost when the change goes live!</p>
        <p>If you have developed a third-party tool or extension for Habitica, please check out <a href='https://github.com/HabitRPG/habitica/pull/10442#issuecomment-396211978' target='_blank'>these notes on GitHub</a> so that you can update if needed.</p>
        <p>Thanks for your understanding as we work to make Habitica better. <3</p>
        <div class="small mb-3">by Paglias</div>
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
  middlewares: [authWithHeaders({
    userFieldsToExclude: ['inbox'],
  })],
  url: '/news/tell-me-later',
  async handler (req, res) {
    const user = res.locals.user;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => {
      return n && n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
