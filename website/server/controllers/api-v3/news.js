import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'LAST CHANCE FOR JUNE ITEMS; NEW OFFICIAL CHALLENGES';
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
            <h2>7/1/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_201906 center-block"></div>
        <h3>Last Chance for Kindly Koi Set</h3>
        <p>Reminder: tomorrow is the last day you can <a href='/user/settings/subscription'>subscribe</a> and receive the Kindly Koi Set! Subscribing also lets you buy Gems with Gold. The longer your subscription, the more Gems you get!</p>
        <p>Thanks so much for your support! You help keep Habitica running.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="promo_oddballs_bundle center-block"></div>
        <h3>Last Chance for Oddballs Pet Quest Bundle</h3>
        <p>Tomorrow is also the last day to buy the discounted Oddballs Pet Quest Bundle, featuring the Rock, Yarn, and Marshmallow Slime quests all for seven gems! Be sure to snag it before it rolls away from the <a href='/shops/quests'>Quest Shop</a>!</p>
        <div class="small">Art by PainterProphet, Pfeffernusse, Zorelya, intune, starsystemic, Leephon, Arcosine, stefalupagus, Hachiseiko, TheMushroomKing, khdarkwolf, Vampitch, JinjooHat, UncommonCriminal, Oranges, Darkly, overomega, celticdragon, and Shaner</div>
        <div class="small mb-3">Writing by Bartelmy, Faelwyn the Rising Phoenix, Theothermeme, Bethany Woll, itokro, and Lemoness</div>
        <div class="scene_hat_guild center-block"></div>
        <h3>July 2019 Resolution Success Challenge and New Take This Challenge</h3>
        <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/a4bb384e-a671-404c-a9e3-0e1bd50688ea'>Convene Your Companions</a>, we're focusing on building accountability with your friends in Habitica's social spaces! It has a 15 Gem prize, which will be awarded to five lucky winners on August 1.</p>
        <p>Congratulations to the winners of June's Challenge, whisperingwraith, katie9, Mavro_Asteri, Chasquared, and Taichi1!</p>
        <p>The next Take This Challenge has also launched, "<a href='/challenges/02ec6294-8a5b-4eae-9c28-ec9b4fd6612f'>Rolling a Natural 1!</a>", with a focus on coping with adversity. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "You've Got a Friend in Me!": grand prize winner 13_phoenix, and runners-up rpelepei, Khaamo, kikithegecko, calankh, and augustgreatsword! Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't completed it already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <div class="promo_take_this center-block"></div>
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
