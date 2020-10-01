import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW SUBSCRIBER ITEMS! MONTHLY HABITICA CHALLENGES! BACK-TO-SCHOOL CHALLENGE AWARDED!';
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
            <h2>10/1/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_202010 center-block"></div>
        <h3>October Subscriber Item Revealed!</h3>
        <p>
          The October Subscriber Item has been revealed: the Beguilingly Batty Item Set! <a
          href='/user/settings/subscription'>Subscribe to Habitica</a> by October 31st to receive
          this exciting set! If you're already an active subscriber, reload the site and then head
          to Inventory > Items to claim your gear!
        </p>
        <p>
          Subscribers also receive the ability to buy Gems with Gold -- the longer you subscribe,
          the more Gems you can buy per month! There are other perks as well, such as longer access
          to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep
          Habitica running. Thank you very much for your support -- it means a lot to us.
        </p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_strength center-block"></div>
        <h3>October 2020 Resolution Success Challenge and Take This Challenge</h3>
        <p>
          The Habitica team has launched a special official Challenge series hosted in the <a
          href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99'>Official New Year's Resolution
          Guild</a>. These Challenges are designed to help you build and maintain goals that are
          destined for success and then stick with them as the year progresses. For this month's
          Challenge, <a href='/challenges/b2aecf4f-d5d6-42b2-af51-f12d33bd5392'>Staying Strong</a>,
          we're focusing on boosting your motivation heading into the final quarter of the year!
          It has a 15 Gem prize, which will be awarded to five lucky winners on November 2nd.
        </p>
        <p>
          Congratulations to the winners of September's Challenge, @Baileythebookworm,
          @FlyingRhino, @RJBPrincess, @frogedog, and @Gardath!
        </p>
        <p>
          The next Take This Challenge has also launched, "<a
          href='/challenges/0e075e70-2763-4716-a6e2-b2650555c0d6'>Do One Thing Well!</a>", with a
          focus on single-tasking and distraction management. Be sure to check it out to earn
          additional pieces of the Take This armor set!
        </p>
        <p>
          <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of
          mental illness.
        </p>
        <p>
          Congratulations to the winners of the last Take This Challenge, "Feed Me, Seymour!":
          grand prize winner @Bebebebee, and runners-up @heidinagtegaal, @DMGdealer,
          @incessantnibbler, @Chenaniah1001, and @maddcappcafe! Plus, all participants in that
          Challenge have received a piece of the <a
          href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set'
          target='_blank'>Take This item set</a> if they hadn't completed it already. It is located
          in your Rewards column. Enjoy!
        </p>
        <div class="small mb-3">
          by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat
        </div>
        <div class="promo_take_this center-block"></div>
        <h3>Back-to-School Preparation Challenge Winners</h3>
        <p>
          The winners of the Habitica Back-to-School Preparation Challenge have been selected!
          Congratulations to: Anna_2410, nickkk99, SSkittles, pechepoint and Amber2311!
        </p>
        <p>
          Thank you to everyone who participated! We're excited to help you pursue your goals
          through the new school year and beyond!
        </p>
        <div class="small mb-3">by Beffymaroo</div>
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
