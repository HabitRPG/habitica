import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW OFFICIAL CHALLENGES AND BEHIND THE SCENES BLOG POST';
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
            <h2>4/2/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="scene_hat_guild center-block"></div>
        <h3>April 2020 Resolution Success Challenge and New Take This Challenge</h3>
        <p>
          The Habitica team has launched a special official Challenge series hosted in the <a
          href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New
          Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain
          goals that are destined for success and then stick with them as the year progresses. For
          this month's Challenge, <a href='/challenges/178ba70c-b446-4fd6-913c-408f6ac40c96'>Gather
          Your Party</a>, we're focusing on finding encouraging allies to help you gain
          accountability for your goals!! It has a 15 Gem prize, which will be awarded to five
          lucky winners on May 1st.
        </p>
        <p>
          Congratulations to the winners of March's Challenge: @mymartianromance,
          @BadWolfandTheStorm, @KatieIrene, @LastminuteKing, and @Janqt!
        </p>
        <div class="promo_take_this center-block"></div>
        <p>
          The next Take This Challenge has also launched, "<a
          href='/challenges/a167f3d9-f32d-46b5-ba4b-5277357f2322'>This One Goes to 11!</a>", with
          a focus on managing feelings of overwhelm. Be sure to check it out to earn additional
          pieces of the Take This armor set!
        </p>
        <p>
          <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of mental
          illness.
        </p>
        <p>
          Congratulations to the winners of the last Take This Challenge, "Gaining Inspiration
          Points": grand prize winner @Susiturrikka, and runners-up @Kereenas-ff, @JohnMakiej,
          @Martes625, @ScarletSlayer, and @bradders154276! Plus, all participants in that Challenge
          have received a piece of the <a
          href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set'
          target='_blank'>Take This item set</a> if they hadn't completed it already. It is located
          in your Rewards column. Enjoy!
        </p>
        <div class="small mb-3">
          by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat
        </div>
        <div class="scene_meditation center-block"></div>
        <h3>Behind the Scenes: Mental Health Tips from the Team</h3>
        <p>
          Hello Habiticans! In this edition of <a
          href='https://habitica.wordpress.com/2020/04/02/behind-the-scenes-coping-in-a-crisis/'
          target='_blank'>Behind the Scenes</a>, some of the Habitica staff and mods are sharing
          some of the ways they're taking care of their mental health, physical well-being, and
          work routines during the current crisis. We hope some of their tips are helpful for you
          as well!
        </p>
        <p>
          Take care! 💜
        </p>
        <div class="small mb-3">by shanaqui and the Habitica Team</div>
      </div>
      `,
    });
  },
};

/**
 * @api {post} /api/v3/news/tell-me-later Allow latest Bailey announcement to be read later
 * @apiName TellMeLaterNews
 * @apiDescription Add a notification to allow viewing of the latest "New Stuff by Bailey" message.
 * Prevent this specific Bailey message from appearing automatically.
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
