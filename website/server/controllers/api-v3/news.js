import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'GUILD AND PARTIES ISSUE, FREE CAKE, AND SPLASHY PALS BUNDLE';
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
            <h2>7/17/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>Issue Affecting Guilds, Parties, and Quests, Plus Cake on Us!</h3>
        <p>Hello Habiticans! Our apologies regarding the outage affecting access to the Tavern, Guilds, and Parties that occurred yesterday. For those who may have had issues with their current Quest, we've granted quest owners a new copy of their Quest scroll and four gems to purchase a Quest or item of your choice. If you have any concerns or if there are any lingering issues with your Guild, Party, or Quest, please contact us at <a href='mailto:admin@habitica.com'>admin@habitica.com</a> and our small team will be happy to fix you up as soon as possible!</p>
        <p>Thanks for your understanding and support! We always feel lucky to have such a wonderful community. :) To thank you all for your patience, we've given everyone delicious cake for their pets!</p>
        <div class="small mb-3">by The Habitica Team <3</div>
        <div class="promo_splashy_pals_bundle center-block"></div>
        <h3>Discounted Pet Quest Bundle: Splashy Pals!</h3>
        <p>If you are looking to add some water-loving pets to your Habitica stable, you're in luck! From now until July 31, you can purchase the Splashy Pals Pet Quest Bundle and receive the Seahorse, Turtle, and Whale quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!</p>
        <div class="small">by Lemoness and SabreCat</div>
        <div class="small">Art by McCoyly, krazjega, UncommonCriminal, zoebeagle, Kiwibot, JessicaChase, Scarabsi, JaizakArpaik</div>
        <div class="small mb-3">Writing by Calae, Ginger_Hanna, Lemoness</div>
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
