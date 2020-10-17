import md from 'habitica-markdown';
import { authWithHeaders } from '../../middlewares/auth';
import { model as NewsPost } from '../../models/newsPost';

const api = {};

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

    const lastNewsPost = NewsPost.lastNewsPost();
    if (lastNewsPost) {
      res.status(200).send({
        html: `
        <div class="bailey">
          <div class="media align-items-center">
            <div class="mr-3 ${baileyClass}"></div>
            <div class="media-body">
              <h1 class="align-self-center">${res.t('newStuff')}</h1>
              <h2>${lastNewsPost.title.toUpperCase()}</h2>
            </div>
          </div>
          <hr/>
          <p>
            ${md.unsafeHTMLRender(lastNewsPost.text)}
          </p>
          <div class="small">
            by ${lastNewsPost.credits}
          </div>
        </div>
        `,
      });
    } else {
      res.status(200).send({
        html: `
        <div class="bailey">
          <div class="media align-items-center">
            <div class="mr-3 ${baileyClass}"></div>
            <div class="media-body">
              <h1 class="align-self-center">${res.t('newStuff')}</h1>
            </div>
          </div>
        </div>
        `,
      });
    }
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
 * @apiGroup News
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

    const lastNewsPost = NewsPost.lastNewsPost();
    if (lastNewsPost) {
      user.flags.lastNewStuffRead = lastNewsPost._id;

      const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
      if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
      user.addNotification('NEW_STUFF', { title: lastNewsPost.title.toUpperCase() }, true); // seen by default

      await user.save();
    }

    res.respond(200, {});
  },
};

export default api;
