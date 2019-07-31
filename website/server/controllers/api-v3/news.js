import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA NAMING DAY! AND LAST CHANCE FOR SUMMER LIMITED ITEMS';
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
            <h2>7/31/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_naming_day_2018 center-block"></div>
        <h3>Habitica Naming Day!</h3>
        <p>Happy Habitica Naming Day! In honor of the day when we changed the name of the app from HabitRPG to Habitica, we've given everyone an achievement, as well as some delicious cake for your pets and mounts. Everyone has also received Royal Purple Gryphon rewards! Depending on how many Naming Days you've celebrated with us, you've received Melior (a Purple Gryphon mount), his little sister Meliora (a Purple Gryphon pet), a Purple Gryphon Helm, or the Purple Gryphon Wing Cloak!</p>
        <p>Thanks for being a Habitica user -- you all mean so much to us. We hope that you enjoy your presents!</p>
        <div class="small mb-3">by Lemoness, Beffymaroo, and Baconsaur</div>
        <div class="promo_mystery_201907 center-block"></div>
        <h3>Last Chance for Beach Buddy Set</h3>
        <p>Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe</a> and receive the three-piece Beach Buddy Set! Subscribing also lets you buy Gems for Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_summer_splash_2019 center-block"></div>
        <h3>Last Chance for Summer Splash Items and Hatching Potions</h3>
        <p>This is also your last chance to get all Summer Splash goodies before they vanish at the end of July 31st! This includes Limited-Edition Outfits, Seasonal Shop purchases, Seasonal Edition Skins, and yes, even Watery and Glass Hatching Potions. Grab them all while you still can!</p>
        <div class="promo_splashy_pals_bundle center-block"></div>
        <h3>Last Chance for Splashy Pals Pet Quest Bundle</h3>
        <p>This is also the final day to buy the discounted Splashy Pals Pet Quest Bundle, featuring the Seahorse, Sea Turtle, and Whale quests all for seven gems! Be sure to catch it in the <a href='/shops/quests'>Quest Shop</a> before it swims away!</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by McCoyly, krazjega, UncommonCriminal, zoebeagle, Kiwibot, JessicaChase, Scarabsi, and JaizakArpaik</div>
        <div class="small mb-3">Writing by Calae, Ginger_Hanna, and Lemoness</div>
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
