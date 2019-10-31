import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITOWEEN! AND LAST CHANCE FOR OCTOBER AND FALL FESTIVAL ITEMS';
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
            <h2>10/31/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Happy Habitoween!</h3>
        <p>It's the last day of the Fall Festival, and all the NPCs are looking monstrous. Plus,
        we have lots of fun things in store...</p>
        <div class="promo_habitoween_2019 center-block"></div>
        <h3>Jack O' Lantern Pets and Mounts!</h3>
        <p>The Flourishing Fields are full of cute carved pumpkins - and it looks like
        <a href='/inventory/stable'>one has followed you home</a>! What kind of pumpkin? It all
        depends on how many Habitoweens you've celebrated with us. Each Habitoween, you'll get a
        new and exciting pumpkin variety!</p>
        <div class="small mb-3">by Lemoness and Beffymaroo</div>
        <h3>Candy for Everyone!</h3>
        <p>It's a feast for your pets and mounts! In honor of the end of the Fall Festival, we've
        given everyone an assortment of candy. You can feed it to your pets in the
        <a href='/inventory/stable'>Stable</a>! Enjoy.</p>
        <div class="small mb-3">by SabreCat and Lemoness</div>
        <div class="promo_fall_festival_2019 center-block"></div>
        <h3>Last Chance for Fall Festival Items, Witchy Familiars Pet Quest Bundle, and Cryptic
        Flame Set</h3>
        <p>This is your last chance to get all Fall Festival items before they vanish at the end
        of October 31st! This includes Limited-Edition Outfits, Seasonal Shop purchases, Seasonal
        Edition Skins and Hair Colors, and yes, even Glow-in-the-Dark, Spooky, and Shadow Hatching
        Potions. Grab them all while you still can!</p>
        <div class="small mb-3">by gawrone, jjgame83, AnnDeLune, ʂʈєƒąʃųƥągųʂ, Katy133, Lilith of
        Alfheim, Definitely not a villain, ShoGirlGeek. cataclysms, maxpendragon, Vikte, mariahm,
        crystalphoenix, AaronTheTwin, tricksy.fox, QuartzFox, Lemoness, Beffymaroo and
        SabreCat</div>
        <p>It's also the last day to get the Witchy Familiars Pet Quest Bundle and receive the
        Rat, Spider, and Frog quests, all for only 7 Gems! That's a discount of 5 Gems from the
        price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest
        Shop</a> before it crawls away!</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by Pandah, UncommonCriminal, Arcosine, starsystemic, RosemonkeyCT,
        Jon Arjinborn, and Breadstrings</div>
        <div class="small mb-3">Writing by Token, Arcosine, and Fluitare</div>
        <p>Plus, today is the final day to <a href='/user/settings/subscription'>subscribe</a> and
        receive the Cryptic Flame set along with other rad subscriber perks!</p>
        <p>Thanks so much for your supporting the site -- you're helping us keep Habitica alive.
        Happy Habitoween!</p>
        <div class="small mb-3">by Beffymaroo</div>
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
