import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR APRIL AND SPRING FLING GOODIES!';
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
            <h2>4/30/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_spring_2020 center-block"></div>
        <h3>Last Chance for Spring Fling Outfits, Spring Customizations, Spring Magic Hatching Potions, and Shiny Seeds</h3>
        <p>
          Spring Fling is coming to a close in Habitica. It's the last day to snag this year's
          limited edition outfits from your Rewards column. Depending on your class, you can be a
          Puddle Mage, Rhinoceros Beetle Warrior, Lapiz Lazuli Rogue, or Iris Healer! Don't miss
          these awesome gear sets, available to purchase with Gold for now!
        </p>
        <div class="small mb-3">by Vikte, gawrone, jjgame83, Shine Caramia, and SabreCat</div>
        <div class="promo_spring_2019 center-block"></div>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> will also be closing when the Gala ends.
          The Seasonal Sorceress is stocking the seasonal edition versions of previous spring
          outfits, now available for Gems instead of Gold, the seasonal Egg Quest, and Shiny Seeds.
        </p>
        <div class="small mb-3">
          by Eslyn, Aspiring Advocate, OuttaMyMind, Lt. Cabel, Vikte, Lalaitha, DialFForFunky,
          Gerald the Pixel, Scarvia, Awesome kitty, usnbfs, Balduranne, PainterProphet,
          Beffymaroo, SabreCat and Lemoness
        </div>
        <div class="promo_spring_potions_2020 center-block"></div>
        <p>
          It's also the final day to <a href='/shops/market'>buy the Birch Bark, Celestial, and
          Shimmer Magic Hatching Potions!</a> If they come back, it won't be until next year at the
          earliest, so don't delay!
        </p>
        <div class="small mb-3">
          by Teto Forever, tricksy.fox, Bonogo, Mara, ravenlune, Ricardo,  and SabreCat
        </div>
        <div class="promo_pastel_skin_hair center-block"></div>
        <p>
          Don't miss the Pastel Skins and Shimmer Hair colors! They're also available in User >
          Customize Avatar until the Gala ends. But once you purchase them, you can use them
          year-round!
        </p>
        <div class="small mb-3">by Lemoness and McCoyly</div>
        <div class="promo_mystery_202004 center-block"></div>
        <h3>Last Chance for Majestic Monarch Set</h3>
        <p>
          Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe</a>
          and receive the Majestic Monarch Set! Subscribing also lets you buy Gems with Gold. The
          longer your subscription, the more Gems you can get!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_april_fools_2020 center-block"></div>
        <h3>Last Chance for Confection Hatching Potion Quest and Garden Potions</h3>
        <p>
          Have you had your eye on the sweet new Confection Hatching Potion Pets from this year's
          April Fool's festivities? Be sure to get the special Waffling with the Fool Quest from
          the <a href='/shops/quests'>Quest Shop</a>! After today, it will not be available again
          for at least one year.
        </p>
        <p>
          Garden Potions, which hatch the fruit and veggie pets from our 2019 April Fool's prank,
          will also disappear from the <a href='/shops/market'>Market</a> after today. Be sure to
          stock up if you haven't already!
        </p>
        <p>
          Note that Confection Pets and Garden Pets do not have mount forms, so plan your purchases
          accordingly!
        </p>
        <div class="small mb-3">by Beffymaroo, Piyo, SabreCat, and Viirus</div>
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
