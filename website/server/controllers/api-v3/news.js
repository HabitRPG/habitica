import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'WINTERY AVATAR CUSTOMIZATIONS AND NEW PET QUEST!';
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
            <h2>1/8/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_wintery_skins center-block"></div>
        <h3>Wintery Skins & Hair Colors</h3>
        <p>The Seasonal Edition Wintery Hair Colors are now available for purchase! Now you can dye your avatar's hair Snowy, Peppermint, Holly Green, Aurora, Winter Star, or Festive.</p>
        <p>Plus, the Seasonal Edition Wintery Skins are available, too! You can complete your winter avatar look with Aurora, Dapper, Festive, Holly, Polar, Sugar, or Winter Star Skins.</p>
        <p>Both of these Seasonal Edition customization sets will only be available to purchase until January 31st, after which they'll be gone until next year, so be sure to scoop them up now! You can find them in User>Edit Avatar!</p>
        <div class="small mb-3">by Lemoness and tricksy.fox</div>
        <div class="quest_velociraptor center-block"></div>
        <h3>New Pet Quest: The Veloci-Rapper!</h3>
        <p>Hone your beats and practice your rhymes--it's time for a rap battle! Get the latest pet quest, <a href='/shops/quests'>The Veloci-Rapper</a>, and earn some clever velociraptor pets by completing your real-life tasks.</p>
        <div class="small">Art by *~Seraphina~*, Procyon P, Lilith of Alfheim, Anna Glassman, Uchihamadara, and Willow the Witty</div>
        <div class="small mb-3">Writing by lilackbar and SabreCat</div>
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
