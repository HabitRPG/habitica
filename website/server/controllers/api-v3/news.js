import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'ALLIGATOR PET QUEST AND SPOOKY SPARKLES!';
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
            <h2>10/09/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <h3>New Pet Quest: The Insta-Gator!</h3>
        <p>Drop what you're doing, right now, and head to the Quest Shop!<sup>*</sup> Get the latest pet quest, <a href='/shops/quests' target='_blank'>The Insta-Gator</a>, and earn some cunning alligator pets by completing your real-life tasks.</p>
        <div class="small">Art by gully, mfonda, UncommonCriminal, tabbytoes, and Willow the Witty</div>
        <div class="small mb-3">Writing by Mike.Antonacci</div>
        <div class="promo_alligator center-block"></div>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Spooky Sparkles in the Seasonal Shop</h3>
            <p>There's a new Gold-purchasable item in the <a href='/shops/seasonal' target='_blank'>Seasonal Shop</a>: Spooky Sparkles! Buy some and then cast it on your friends. I wonder what it will do?</p>
            <p>If you have Spooky Sparkles cast on you, you will receive the "Alarming Friends" badge! Don't worry, any mysterious effects will wear off the next day.... or you can cancel them early by buying an Opaque Potion!</p>
            <p>While you're at it, be sure to check out all the other items in the Seasonal Shop! There are lots of equipment items from the previous Fall Festivals. The Seasonal Shop will only be open until October 31st, so stock up now.</p>
          </div>
          <div class="promo_spooky_sparkles ml-3"></div>
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
