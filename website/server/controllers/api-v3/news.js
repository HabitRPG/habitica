import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW SUBSCRIBER ITEMS, RESOLUTION SUCCESS CHALLENGE, AND TAKE THIS CHALLENGE!';
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
            <h2>3/2/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_202003 center-block"></div>
        <h3>March Subscriber Items Revealed!</h3>
        <p>
          The March Subscriber Item has been revealed: the Barbed Battler Item Set! <a
          href='/user/settings/subscription'>Subscribe to Habitica</a> by March 31 to receive this
          exciting set! If you're already an active subscriber, reload the site and then head to
          Inventory > Items to claim your gear!
        </p>
        <p>
          Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe,
          the more gems you can buy per month! There are other perks as well, such as longer access
          to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep
          Habitica running. Thank you very much for your support -- it means a lot to us.
        </p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_gaining_achievement center-block"></div>
        <h3>New Resolution Success Challenge and Take This Challenge!</h3>
        <p>
          The Habitica team has launched a special official Challenge series hosted in the <a
          href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New
          Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain
          goals that are destined for success and then stick with them as the year progresses. For
          this month's Challenge, <a href='/challenges/ad50c909-eb5d-4b34-83ca-52b2122f1451'>Reach
          for Your First Achievement</a>, we're focusing on setting smaller mini-goals as
          milestones! It has a 15 Gem prize, which will be awarded to five lucky winners on April
          1st.
        </p>
        <p>
          Congratulations to the winners of the February Challenge: @2muchomework, @Meylin_uwu,
          @OpCit, @dejavudu, and @rebeccafae!
        </p>
        <p>
          The next Take This Challenge has also launched, "<a
          href='/challenges/96980722-77b2-4a76-8bba-358558fe1a19'>Gaining Inspiration Points!</a>",
          with a focus on capturing creativity. Be sure to check it out to earn additional pieces
          of the Take This armor set!
        </p>
        <p>
          <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of mental
          illness.
        </p>
        <p>
          Congratulations to the winners of the last Take This Challenge, "Multiplayer Co-Op
          Exercise!": grand prize winner SimpleMan, and runners-up @damole, @BrittySpitty1013,
          @LeScalpeurDeCarottes, @Eziorocks, and @k4m3n! Plus, all participants in that Challenge
          have received a piece of the <a
          href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set'
          target='_blank'>Take This item set</a> if they hadn't completed it already. It is located
          in your Rewards column. Enjoy!
        </p>
        <div class="small mb-3">
          by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat
        </div>
        <div class="promo_take_this center-block"></div>
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
