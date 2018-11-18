import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'ODDBALLS PET QUEST BUNDLE AND SPOTLIGHT ON SLEEP';
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
            <h2>11/15/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_oddballs_bundle center-block"></div>
        <h3>New Discounted Pet Quest Bundle: Oddballs!</h3>
        <p>If you are looking to add some goofy offbeat pets to your Habitica stable, you're in luck! From now until November 30, you can purchase the Oddball Pet Quest Bundle and receive the Rock, Marshmallow Slime, and Yarn quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!</p>
        <div class="small">Art by PainterProphet, Pfeffernusse, Zorelya, intune, starsystemic, Leephon, Arcosine, stefalupagus, Hachiseiko, TheMushroomKing, khdarkwolf, Vampitch, JinjooHat, UncommonCriminal, Oranges, Darkly, overomega, celticdragon, and Shaner</div>
        <div class="small mb-3">Writing by Bartelmy, Faelwyn the Rising Phoenix, Theothermeme, Bethany Woll, itokro, and Lemoness</div>
        <div class="scene_sleep center-block"></div>
        <h3>Use Case Spotlight and Guild Spotlight on Sleep and Rest</h3>
        <p>We've got new posts on the blog all about ways to use Habitica to help you with self-care related to sleep and rest! First, there's a <a href='https://habitica.wordpress.com/2018/11/15/taking-a-break-guild-spotlight/' target='_blank'>Guild Spotlight</a> that highlights the Guilds that can help you as you explore ways to use Habitica to help with sleep hygiene and taking breaks. We've also posted a <a href='https://habitica.wordpress.com/2018/11/15/use-case-spotlight-sleep-and-rest/' target='_blank'>Use Case Spotlight</a> featuring a number of great suggestions for using Habitica's task system to manage this as well! These suggestions were submitted by Habiticans in the <a href='/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6' target='_blank'>Use Case Spotlights Guild</a>.</p>
        <p>Plus, we're collecting user submissions for the next Use Case Spotlight! How do you use Habitica for professionalization and "adulting" skills? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by shanaqui</div>
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
