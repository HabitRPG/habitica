import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'WINTER WONDERLAND BEGINS! CLASS OUTFITS, QUESTS, AND HATCHING POTIONS';
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
            <h2>12/19/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <p>
          A wintery breeze is blowing in from the Stoïkalm Steppes, and the snow is gently drifting
          down over Habit City. The Winter Wonderland event has begun!
        </p>
        <div class="promo_winter_wonderland_2020 center-block"></div>
        <h3>Winter Class Outfits</h3>
        <p>
          From now until January 31st, limited edition outfits are available in the Rewards column.
          Depending on your class, you can be an Evergreen Warrior, Bell Mage, Winter Spice Healer,
          or Lantern Rogue! You'd better get productive to earn enough Gold before they disappear.
          Good luck!
        </p>
        <div class="small mb-3">by Vikte, gawrone, jjgame83, Aspiring Advocate, and SabreCat</div>
        <div class="promo_winter_wonderland_2019 center-block"></div>
        <h3>Seasonal Shop is Open!</h3>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> has opened! The Seasonal Sorceress is
          stocking the seasonal edition versions of previous winter outfits, now available for Gems
          instead of Gold, and the Winter Quest Chain. Plus, there will be more fun things in the
          shop as the event progresses. The Seasonal Shop will only be open until January 31st, so
          don't wait!
        </p>
        <div class="small mb-3">
          by Lt Cabel, Vikte, AnnDeLune, Persephone, WeeWitch, katy133, yayannabelle, Stefalupagus,
          Io Breese, foreverender, Podcod, Beffymaroo, SabreCat, and Lemoness
        </div>
        <div class="promo_winter_quests_bundle center-block"></div>
        <h3>Discounted Quest Bundle: Winter Quests</h3>
        <p>
          If you're looking to add some cold weather friends to your Habitica stable, you're in
          luck! From now until January 31, you can purchase the Winter Quest Bundle and receive the
          Trapper Santa, Find the Cub, and Penguin quests, all for only 7 Gems! That's a discount
          of 5 Gems from the price of purchasing them separately. Check it out in the <a
          href='/shops/quests'>Quest Shop</a> today!
        </p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">
          Art by UncommonCriminal, Shaner, Eevachu, Pandoro, melynnrose, Breadstrings, Rattify, and
          PainterProphet
        </div>
        <div class="small mb-3">Writing by Lefnire, Leephon, and Daniel the Bard</div>
        <div class="promo_winter_potions_2020 center-block"></div>
        <h3>New Aurora Hatching Potions and the Return of Holly and Starry Night!</h3>
        <p>
          There's a new pet breed in town! Check out the brand-new Aurora Potions and the return
          of Holly and Starry Night Potions to brighten your Winter Wonderland avatar look. Buy
          them from <a href='/shops/market'>the Market</a> and use them to hatch any standard pet
          egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Magic Hatching Potion Pets
          aren't picky, so they'll happily eat any kind of food that you feed them!
        </p>
        <p>
          After they're gone, it will be at least a year before these three Hatching Potions are
          available again, so be sure to get them now!
        </p>
        <div class="small mb-3">
          by QuartzFox, Archeia, Willow The Witty, JinjooHat, Tyche Alba, and SabreCat
        </div>
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
