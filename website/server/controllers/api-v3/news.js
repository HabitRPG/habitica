import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA BIRTHDAY PARTY! AND LAST CHANCE FOR WINTER WONDERLAND';
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
            <h2>1/31/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_birthday_2020 center-block"></div>
        <h3>Habitica Birthday Bash</h3>
        <p>
          January 31st is Habitica's Birthday! Thank you so much for being a part of our
          community - it means a lot.
        </p>
        <p>Now come join us and the NPCs as we celebrate!</p>
        <h3>Cake for Everybody!</h3>
        <p>
          In honor of the festivities, everyone has been awarded an assortment of yummy cake to
          feed to your pets! Plus, for the next two days <a href='/shops/market'>Alexander the
          Merchant</a> is selling cake in his shop, and cake will sometimes drop when you complete
          your tasks. Cake works just like normal pet food, but if you want to know what type of
          pet likes each slice, <a href='http://habitica.wikia.com/wiki/Food' target='_blank'>the
          wiki has spoilers</a>.
        </p>
        <h3>Party Robes</h3>
        <p>There are Party Robes available for free in the Rewards column! Don them with pride.</p>
        <h3>Birthday Bash Achievement</h3>
        <p>
          In honor of Habitica's birthday, everyone has been awarded the Habitica Birthday Bash
          achievement! This achievement stacks for each Birthday Bash you celebrate with us.
        </p>
        <div class="promo_mystery_202001 center-block"></div>
        <h3>Last Chance for Fabled Fox Set</h3>
        <p>
          Reminder: this is the final day to <a href='/user/settings/subscription'>subscribe</a>
          and receive the Fabled Fox Set! Subscribing also lets you buy Gems with Gold and get
          other great perks like a special Jackalope Pet!
        </p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_winter_wonderland_2020 center-block"></div>
        <h3>Last Chance for Winter Wonderland Goodies!</h3>
        <p>
          Winter Wonderland is coming to a close in Habitica. It's the last day to snag this year's
          limited edition outfits from your Rewards column. Depending on your class, you can be an
          Evergreen Warrior, Bell Mage, Winter Spice Healer, or Lantern Rogue! Don't miss these
          awesome gear sets, available to purchase with Gold!
        </p>
        <div class="small mb-3">by Vikte, gawrone, jjgame83, Aspiring Advocate, and SabreCat</div>
        <p>
          The <a href='/shops/seasonal'>Seasonal Shop</a> will also be closing when the Gala ends.
          The Seasonal Sorceress is stocking the seasonal edition versions of previous winter
          outfits, now available for Gems instead of Gold, and the Trapper Santa and Find the Cub
          Quests.
        </p>
        <div class="small mb-3">
          by Lt Cabel, Vikte, AnnDeLune, Persephone, WeeWitch, katy133, yayannabelle, Stefalupagus,
          Io Breese, foreverender, Podcod, Beffymaroo, SabreCat and Lemoness
        </div>
        <p>
          It's also the final day to <a href='/shops/market'>buy Starry Night, Holly, and new
          Aurora Magic Hatching Potions!</a> If they come back, it won't be until next year at the
          earliest, so don't delay!
        </p>
        <div class="small mb-3">
          by QuartzFox, Archeia, Willow The Witty, JinjooHat, Tyche Alba, and SabreCat
        </div>
        <p>
          This is also the final day to buy our special Winter Quests! You can purchase Find the
          Cub and Trapper Santa quests in the Seasonal Shop individually for four Gems each, or you
          can get the discounted Winter Pet Quest Bundle, featuring Trapper Santa, Find the Cub and
          the Penguin quest all for seven Gems in the <a href='/shops/quests'>Quest Shop!</a>
        </p>
        <p>
          Please note that the Find the Cub and Trapper Santa quests only need to be completed once
          each to obtain the rare Polar Bear pet and mount.
        </p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">
          Art by UncommonCriminal, Shaner, Eevachu, Pandoro, melynnrose, Breadstrings, Rattify, and
          PainterProphet
        </div>
        <div class="small mb-3">Writing by Lefnire, Leephon, and Daniel the Bard</div>
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
