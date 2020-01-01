import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'JANUARY SUBSCRIBER ITEMS AND OFFICIAL HABITICA CHALLENGES!';
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
            <h2>1/1/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_mystery_202001 center-block"></div>
        <h3>January Subscriber Items Revealed!</h3>
        <p>
          The January Subscriber Items have been revealed: the Fabled Fox Item Set! You'll receive
          this set if you <a href='/user/settings/subscription'>subscribe to Habitica</a> by
          January 31. If you're already an active subscriber, reload the site and then head to
          Inventory > Items to claim your gear!
        </p>
        <p>
          Subscribers also receive the ability to buy Gems with Gold and other awesome perks! Plus,
          our Gift-One-Get-One promotion is running now, so it's the perfect time to check it out.
          Gift-One-Get-One runs until January 6.
        </p>
        <p>Thank you very much for your support -- it means a lot to us.</p>
        <div class="small mb-3">by Beffymaroo</div>
        <div class="scene_list center-block"></div>
        <h3>January 2020 Resolution Success Challenge and Take This Challenge</h3>
        <p>
          The Habitica team has launched a special official Challenge series hosted in the <a
          href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New
          Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain
          goals that are destined for success and then stick with them as 2020 progresses.
        </p>
        <p>
          Check out the first New Year's Resolution Challenge of the year to start your path to
          resolution success! In <a href='/challenges/463efbbf-8d98-413d-9bdc-708ab336414e'>Begin
          Your Quest</a>, we're focusing on choosing realistic and achievable resolutions! One
          grand-prize winner will receive their choice of a one-month gift subscription to Habitica
          or 25 Gems when it closes on February 3rd. Four lucky runners-up will get a 15 Gem prize.
        </p>
        <p>
          Congratulations to the winners of December's Challenge, @AndoJun, @SilverSquirrel,
          @CathB, @IntegrationAsh, and @DerRue!
        </p>
        <div class="promo_take_this center-block"></div>
        <p>
          The next Take This Challenge has also launched, <a
          href='/challenges/8a4beff7-ce41-48de-b963-7194f85b656e'>Hero's Triumph</a>, with a focus
          on volunteering. Be sure to check it out to earn additional pieces of the Take This armor
          set!
        </p>
        <p>
          <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of mental
          illness.
        </p>
        <p>
          Congratulations to the winners of the last Take This Challenge, "Test Thy Courage!":
          grand prize winner @r-flan2020, and runners-up @SPLOOean, @Bobette37, @WizardGnome,
          @pearlygeek, and @drilcipher! Plus, all participants in that Challenge have received a
          piece of the <a
          href='http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set' target=
          '_blank'>Take This item set</a> if they hadn't completed it already. It is located in
          your Rewards column. Enjoy!
        </p>
        <div class="small mb-3">
          by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat
        </div>
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
