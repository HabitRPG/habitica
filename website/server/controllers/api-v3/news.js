import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW OFFICIAL HABITICA CHALLENGES! RESOLUTION SUCCESS AND TAKE THIS';
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
            <h2>11/1/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_seaserpent center-block"></div>
        <p>The Habitica team has launched a special official Challenge series hosted in the
          <a href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official
          New Year's Resolution Guild</a>. These Challenges are designed to help you build and
          maintain goals that are destined for success and then stick with them as the year
          progresses. For this month's Challenge, <a
          href='/challenges/810ba103-bc72-4ba0-810f-fc45703edc5e'>Here Be Dragons</a>, we're
          focusing on obstacles that arise as you reach the end of the year! It has a 15 Gem
          prize, which will be awarded to five lucky winners on December 2nd.</p>
        <p>Congratulations to the winners of October's Challenge, @boxofdelights, @aethelflaeda,
          @pygy, @threethreethree, and @ScarlettJill!</p>
        <div class="promo_take_this center-block"></div>
        <p>The next Take This Challenge has also launched,
          "<a href='/challenges/661e1352-1ed2-44d3-8175-ec8413293391'>Cast of Characters</a>",
          with a focus on processing our feelings by turning them into characters in a game or
          story. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
        <p><a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of mental
          illness.</p>
        <p>Congratulations to the winners of the last Take This Challenge, "Check Your HP!": grand
          prize winner @shadowdancer16, and runners-up @kuumathebronze, Ras Algathier, @OldMan76,
          @JuanaTango, and @Khontis! Plus, all participants in that Challenge have received a
          piece of the
          <a href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set'
          target='_blank'>Take This item set</a> if they hadn't completed it already. It is
          located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and
          SabreCat</div>
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

    user.flags.newStuff = false;

    const existingNotificationIndex = user.notifications.findIndex(n => n && n.type === 'NEW_STUFF');
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

export default api;
