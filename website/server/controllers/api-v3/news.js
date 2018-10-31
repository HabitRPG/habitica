import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITOWEEN! PLUS LAST CHANCE FOR FALL FESTIVAL AND OCTOBER SUBSCRIBER ITEMS';
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
            <h2>10/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Happy Habitoween!</h3>
        <p>It's the last day of the Fall Festival, and all the NPCs are looking monstrous. Plus, we have lots of fun things in store...</p>
        <h3>Jack O' Lantern Pets and Mounts</h3>
        <p>The Flourishing Fields are full of cute carved pumpkins - and it looks like one has <a href='/inventory/stable' target='_blank'>followed you home</a>! What kind of pumpkin? It all depends on how many Habitoweens you've celebrated with us. Each Habitoween, you'll get a new and exciting pumpkin variety!</p>
        <div class="small mb-3">by Lemoness and Beffymaroo</div>
        <div class="promo_jackolanterns center-block"></div>
        <h3>Candy for Everyone!</h3>
        <p>It's a feast for your pets and mounts! In honor of the end of the Fall Festival, we've given everyone an assortment of candy. You can feed it to your pets in the <a href='/inventory/stable' target='_blank'>Stable</a>! Enjoy.</p>
        <div class="small mb-3">by SabreCat and Lemoness</div>
        <div class="promo_mystery_201810 center-block"></div>
        <h3>Last Chance for Fall Festival Items and Dark Forest Set</h3>
        <p>This is your last chance to get all Fall Festival items before they vanish at the end of October 31st! This includes Limited-Edition Outfits, Seasonal Shop purchases, Seasonal Edition Skins and Hair Colors, and yes, even Ghost and Glow Hatching Potions. Grab them all while you still can!</p>
        <p>Plus, today is the final day to <a href='/user/settings/subscription' target='_blank'>subscribe</a> and receive the Dark Forest set! Subscribing also lets you buy Gems for Gold and nets you a special Jackalope pet.</p>
        <p>Thanks so much for your supporting the site -- you're helping us keep Habitica alive. Happy Habitoween!</p>
        <div class="small mb-3">by Hermi, AaronTheTwin, tricksy.fox, Lemoness, Beffymaroo and SabreCat</div>
        <div class="promo_ghost_potions center-block"></div>
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
