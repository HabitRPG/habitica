import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR SUMMER SPLASH OUTFITS, SUMMER AVATAR CUSTOMIZATIONS, MAGIC HATCHING POTIONS, AND SEAFOAM';
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
            <h2>7/30/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_summer_splash_2020 center-block"></div>
        <p>
          Summer Splash is coming to a close in Habitica on July 31, so be sure to snag this year's
          limited edition outfits from your Rewards column. Depending on your class, you can be an
          Oarfish Mage, Crocodile Rogue, Rainbow Trout Warrior, or Sea Glass Healer. Don't miss
          these awesome gear sets, available to purchase with Gold for now!
        </p>
        <div class="small mb-3">by jjgame83, QuartzFox, Vyllan, Vikte, and SabreCat</div>
        <div class="promo_summer_splash_2019 center-block"></div>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> will also close when the Gala ends. The
          Seasonal Sorceress is stocking the seasonal edition versions of previous summer outfits,
          now available for Gems instead of Gold, and Seafoam.
        </p>
        <div class="small mb-3">
          by SabreCat, Lemoness, AnnDeLune, Vikte, gawrone, TheDudeAbides, Lalaitha, Beffymaroo,
          Vampitch, nonight, tricksy.fox, Giu09, JaizakArpaik, TetoForever, and Kai
        </div>
        <div class="promo_sand_sculpture_potions center-block"></div>
        <p>
          <a href='/shops/market'>Watery, Aquatic, and Sand Sculpture Magic Hatching Potions</a>
          are also leaving the Market on July 31. If they come back, it won't be until next year at
          the earliest, so don't delay!
        </p>
        <div class="small mb-3">
          by Shine Caramia, a_diamond, Persephone, Stefalupagus, Beffymaroo and SabreCat
        </div>
        <div class="promo_splashy_skins center-block"></div>
        <p>
          Don't miss the Splashy Skins! They're also available in User > Customize Avatar until the
          Gala ends. But once you purchase them, you can use them year-round!
        </p>
        <div class="small mb-3">by Lemoness and UncommonCriminal</div>
        <div class="promo_mystery_201008 center-block"></div>
        <h3>Last Chance for Outstanding Orca Set</h3>
        <p>
          You have until July 31 to <a href='/user/settings/subscription'>subscribe</a> and receive
          the Outstanding Orca Set! Subscribing also lets you buy Gems with Gold. The longer your
          subscription, the more Gems you can get!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running ad-free.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_aquatic_amigos_bundle center-block"></div>
        <h3>Last Chance for Aquatic Amigos Pet Quest Bundle</h3>
        <p>
          Lastly, don't forget the discounted Aquatic Amigos Pet Quest Bundle, featuring the
          Axolotl, Cuttlefish, and Octopus quests all for seven Gems! Be sure to snag it from the
          <a href='/shops/quests'>Quest Shop</a> before it splashes out of sight when the Gala
          closes.
        </p>
        <div class="small mb-3">
          by PainterProphet, Streak, James Danger, hazel, RiverMori, UncommonCriminal, Urse,
          RBrinks, TokenKnight, wolvenhalo, Lemoness, and SabreCat
        </div>
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
