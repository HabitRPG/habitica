import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'JUNE 2018 RESOLUTION SUCCESS CHALLENGE AND TAKE THIS CHALLENGE';
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
        <h2>6/1/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media">
          <div class="media-body">
            <p>The Habitica team has launched a special official Challenge series hosted in the <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href='/challenges/07f492bc-3d0a-460e-a525-165dd219a91d' target='_blank'>Mark Your Journey</a>, we're reflecting on your achievements since January and looking ahead to the rest of the year! It has a 15 Gem prize, which will be awarded to five lucky winners on July 2nd.</p>
            <p>Congratulations to the winners of the May Challenge, RubberSoul, Carolee, MyNameIsNotRyn, Rapunculus IV, and notunremarkable!</p>
          </div>
          <div class="scene_hiking ml-3"></div>
        </div>
        <p>The next Take This Challenge has also launched, <a href='/challenges/f0481f95-1dde-4ae7-a876-d19502a45d61' target='_blank'>Hero's Triumph!</a>, with a focus on volunteer efforts. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <div class="media">
          <div class="promo_take_this mr-3 mb-3"></div>
          <div class="media-body">
            <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
          </div>
        </div>
        <p>Congratulations to the winners of the last Take This Challenge, "Keep Calm and Carry On!": grand prize winner Betsy, and runners-up Caiwan (Sári Péter), tebrilas, Christopher, eeyoregirl, and Serenity. Plus, all participants in that Challenge have received a piece of the <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target='_blank'>Take This item set</a> if they hadn't collected all the pieces already. It is located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
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
