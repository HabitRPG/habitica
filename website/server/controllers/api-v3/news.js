import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'GIFT A SUBSCRIPTION, GET A SUBSCRIPTION! AND HABITICA BLOG POSTS';
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
        <div class="media align-items-center">
          <div class="mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
            <h2>12/18/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_g1g1 center-block"></div>
        <h3>Gift a Subscription and Get One Free!</h3>
        <p>In honor of the season of giving--and due to popular demand!--we're bringing back a very special promotion from today through January 15. Now when you gift somebody a subscription, you get the same subscription for yourself for free!</p>
        <p>Subscribers get tons of perks every month, including exclusive items, the ability to buy Gems with Gold, a cute exclusive Jackalope Pet, and increased data history. Plus, it helps keep Habitica running :) To gift a subscription to someone, just open their profile and click the present icon in the upper right. You can open their profile by clicking their avatar in your party header or their name in chat.</p>
        <p>This promotion is only available on <a href='https://habitica.com/'>the web</a> for now, but it will be coming to the Habitica mobile apps very soon.</p>
        <p>Please note that this promotion only applies when you gift to another Habitican. If you or your gift recipient already have a recurring subscription, the gifted subscription will only start after that subscription is cancelled or has expired. Thanks so much for your support! <3</p>
        <div class="small mb-3">by SabreCat and viirus</div>
        <div class="promo_todos center-block"></div>
        <h3>Wiki Feature: Habitican Shared Lists</h3>
        <p>This month's <a href='https://habitica.wordpress.com/2018/12/12/habitican-shared-task-lists/' target='_blank'>featured Wiki article</a> is about Habitican Shared Lists! We hope that it will help you as you explore new possibilities for your task list. Be sure to check it out, and let us know what you think by reaching out on <a href='https://twitter.com/habitica' target='_blank'>Twitter</a>, <a href='http://blog.habitrpg.com' target='_blank'>Tumblr</a>, and <a href='https://facebook.com/habitica' target='_blank'>Facebook</a>.</p>
        <div class="small mb-3">by shanaqui and the Wiki Wizards</div>
        <div class="promo_studying center-block"></div>
        <h3>Use Case and Guild Spotlights on Professionalization and Adulting Skills</h3>
        <p>We've got new posts on the blog all about ways to use Habitica to help with all those pesky "grown-up" tasks! First, there's a <a href='https://habitica.wordpress.com/2018/12/18/professionalization-and-adulting-skills-guild-spotlight/' target='_blank'>Guild Spotlight</a> that highlights the Guilds that can help you as you explore ways to use Habitica to boost your adulting level. Next, we have a <a href='https://habitica.wordpress.com/2018/12/18/use-case-spotlight-professionalization-and-adulting-skills/' target='_blank'>Use Case Spotlight</a> with adulting and professionalization tips! These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
        <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica to establish new habits? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
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
      return n && n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;
