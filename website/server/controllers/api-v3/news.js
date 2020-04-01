import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HAPPY APRIL FOOLS DAY! (ALSO SUBSCRIBER MYSTERY ITEMS)';
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
            <h2>4/1/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_april_fools_2020 center-block"></div>
        <h3>Dessert Pets!</h3>
        <p>
          The April Fool rushes into the Tavern, clearly out of breath, with a gigantic picnic
          basket in tow. The heavenly smell of icing and chocolate wafts from the open basket into
          the crowd.
        </p>
        <p>
          "HABITICANS!" he cries. "I have heard you are all in need of some good cheer and comfort,
          and here I am! I hope you don't mind, in rather a turnaround from last year, I've brought
          along some treats to brighten your day."
        </p>
        <p>
          "Looks like this year he's turned our pets into desserts!" says Piyo. She picks up her
          new cinnamon bun companion gently. "Awww, they're so perfect and sweet!"
        </p>
        <p>
          Equipping different pets will show different desserts. Have fun discovering them all!
        </p>
        <div class="npc_aprilFool center-block"></div>
        <h3>Special April Fool's Social Media Challenge!</h3>
        <p>
          For even more fun, check out the <a href='/challenges/'>official Challenge</a> posted
          especially for today! Share your avatar featuring your new dessert pet on social media
          between now and April 3, and you'll have a chance to win Gems and have your avatar
          featured on the Habitica Blog!
        </p>
        <div class="small mb-3">by Beffymaroo, SabreCat, Piyo, and Viirus</div>
        <div class="promo_mystery_202004 center-block"></div>
        <h3>April Subscriber Items Revealed!</h3>
        <p>
          The April Subscriber Items have been revealed: the Majestic Monarch Item Set! <a
          href='/user/settings/subscription'>Subscribe to Habitica</a> by April 30 to receive this
          exciting set! If you're already an active subscriber, reload the site and then head to
          Inventory > Items to claim your gear!
        </p>
        <p>
          Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe,
          the more Gems you can buy per month! There are other perks as well, such as longer access
          to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep
          Habitica running. Thank you very much for your support -- it means a lot to us.
        </p>
        <div class="small mb-3">by Beffymaroo</div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
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
    const { user } = res.locals;

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
