import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'THANKSGIVING IN HABITICA, NOVEMBER SUBSCRIBER ITEMS, AND ANDROID UPDATE';
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
                <h1 class="align-self-center markdown">${res.t('newStuff')}</h1>
            </div>
        </div>
        <h2>11/17/2017 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
            <div class="promo_turkey_day_2017 right-margin"></div>
            <div class="media-body d-flex align-self-center flex-column">
                <h3>Happy Thanksgiving!</h3>
                <p>It's Thanksgiving in Habitica! On this day Habiticans celebrate by spending time with loved ones, giving thanks, and riding their glorious turkeys into the magnificent sunset. Some of the NPCs are celebrating the occasion!</p>
                <h3>Turkey Pets, Mounts, and Costume!</h3>
                <p>For the occasion, all Habiticans have received Turkey-themed items! What items? It all depends on how many Habitica Thanksgivings you've celebrated with us. Each Thanksgiving, you'll get a new and exciting Turkey pet, mount, or gear set! Check
                    your Stable and your pinned Rewards to see what you got!</p>
                <p>Thank you for using Habitica - we really love you all
                    <3</p>
                        <div class="small mb-3">by Lemoness</div>
            </div>
        </div>
        <div class="media">
            <div class="media-body">
                <h3>November Subscriber Items Revealed!</h3>
                <p class="markdown">The November Subscriber Items have been revealed: the <a href="https://habitica.com/user/settings/subscription" target="_blank">Carpet Rider Item Set</a>! You have until November 30 to receive the item set when you subscribe. If you're already an active subscriber, reload the site and then head to Inventory &gt; Items to claim your gear!&quot;"></p>
                <p>Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions
                    let us keep Habitica running. Thank you very much for your support -- it means a lot to us.</p>
                <div class="small mb-3">by Lemoness</div>
            </div>
            <div class="promo_mystery_201711 left-margin ml-3"></div>
        </div>
        <h3>Android App Update</h3>
        <p>There’s an exciting new update to our Android app!</p>
        <ul>
            <li>We’ve smashed some pesky bugs, including the issue with task reordering!</li>
            <li>You can now view and assign attribute points (or choose auto-allocation)!</li>
            <li>We’ve added Equipment to the Market, plus the ability to change your login name and email, reset or delete your account, make changes to your profile, and access Fix Character Values.</li>
            <li>You can also request a password reset from the login screen!</li>
        </ul>
        <p>We hope this makes your Habitica experience even better. Be sure to download the update now for a better Habitica experience!</p>
        <p>If you like the improvements that we’ve been making to our app, please consider reviewing this new version. It really helps us out!</p>
        <div class="small mb-3">by Viirus and piyorii</div><br/>
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