import { authWithHeaders } from '../../middlewares/auth';
import { model as NewsPost } from '../../models/newsPost';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
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
          </div>
        </div>
        <hr/>
        <div class="quest_ruby center-block"></div>
        <p>
          It's time for a trip to the snowy hot springs of Stoïkalm! <a href='/shops/quests'>Get
          the latest Magic Hatching Potion quest</a>, "Ruby Rapport", and collect Ruby Gems,
          Aquarius Zodiac Runes, and Venus Runes to earn some glittering Ruby Magic Hatching
          Potions by completing your real-life tasks!
        </p>
        <div class="small">
          Art by Aspiring_Advocate, gully, Beffymaroo, Tyche_Alba, and loremi
        </div>
        <div class="small mb-3">Writing by JohnJSal</div>
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

    const { id, title } = NewsPost.lastNewsPost();
    user.flags.lastNewStuffRead = id;

    user.addNotification('NEW_STUFF', { title: title.toUpperCase() }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
