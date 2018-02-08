import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW PET QUEST AND USE CASE SPOTLIGHT';
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
        <h2>2/6/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
          <div class="quest_badger"></div>
          <div class="media-body">
            <h3>New Pet Quest: Stop Badgering Me!</h3>
            <p>Winter has come to the Taskwoods, but the Fairies aren't hibernating yet because the Badgering Bother won't stop pestering them! Get the latest pet quest, <em>Stop Badgering Me!</em>, from the <a href="/shops/quests">Quest Shop</a>, and earn some bustling badger pets by completing your real-life tasks.</p>
            <div class="small mb-3">by SabreCat and Lemoness</div>
            <div class="small mb-3">Written by Lil Ackbar and Lemoness</div>
            <div class="small mb-3">Art by plumilla, LilithofAlfheim, and Willow the Witty</div>
          </div>
        </div>
        <div class="media">
          <div class="media-body">
            <h3 class="mt-5">Use Case Spotlight: Interpersonal Relationships</h3>
            <p>This month's <a href="https://habitica.wordpress.com/2018/02/06/use-case-spotlight-interpersonal-relationships/" target="_blank">Use Case Spotlight</a> is about Interpersonal Relationships! It features a number of great suggestions submitted by Habiticans in the <a href="/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6">Use Case Spotlights Guild</a>. We hope it helps any of you who might be looking for advice to help nurture your relationships.</p>
          </div>
          <div class="scene_tavern ml-3 mb-3"></div>
        </div>
        <p>Plus, we're collecting user submissions for the next spotlight! How do you use Habitica for Spring Cleaning? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!</p>
        <div class="small mb-3">by Beffymaroo</div>

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
