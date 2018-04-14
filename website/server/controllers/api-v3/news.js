import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'SQUIRREL PET QUEST AND APRIL FOOLS CHALLENGE WINNERS';
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
        <div class="media">
          <div class="align-self-center mr-3 ${baileyClass}"></div>
          <div class="media-body">
            <h1 class="align-self-center">${res.t('newStuff')}</h1>
          </div>
        </div>
        <h2>4/10/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
          <h3>New Pet Quest: The Sneaky Squirrel</h3>
          <p>Squirrels are loose, jamming up Habitican routines with stray acorns! Find and confront the hoarder in the latest pet quest, <a href='/shops/quests/' target='_blank'>The Sneaky Squirrel</a>, and earn some bushy-tailed squirrel pets by completing your real-life tasks.</p>
          <div class="small">Art by randomdaisy, Shtut, virginiamoon, confusedcicada, and WillowTheWitty</div>
          <div class="small mb-3">Writing by Cantras and SabreCat</div>
          </div>
          <div class="quest_squirrel ml-3"></div>
        </div>
        <h3>April Fool's Challenge Winners and Blog Post!</h3>
        <p>The winners of the April Fool's Social Media Challenge have been selected! Congratulations to: Al Lith, Frar of the Lonely Mountain, Garwinna, Meakuel, and Koliz!</p>
        <p>Thank you to everyone who shared their awesome pics with their tiny pets and mounts! You can see a fun <a href='https://habitica.wordpress.com/2018/04/10/its-the-little-things-tiny-pet-and-mount-pics-from-habiticas-april-fools-celebration/' target='_blank'>recap of the shenanigans</a> on our blog. Stay tuned to see what wacky antics the Fool gets up to next year!</p>
        <div class="small mb-3">by Beffymaroo and SabreCat</div>
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
