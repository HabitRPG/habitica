import { authWithHeaders } from '../../middlewares/auth';

const api = {};

// @TODO export this const, cannot export it from here because only routes are exported from
// controllers
const LAST_ANNOUNCEMENT_TITLE = 'FEBRUARY BACKGROUNDS, ARMOIRE ITEMS, AND OFFICIAL HABITICA CHALLENGES!';
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
            <h2>2/4/2020 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_armoire_backgrounds_202002 center-block"></div>
        <h3>February Backgrounds and Armoire Items!</h3>
        <p>
          We’ve added three new backgrounds to the Background Shop! Now your avatar can dance the
          night away in an Elegant Ballroom, partake in a fancy Tea Party, and admire the Habitica
          Hall of Heroes. Check them out under User Icon > Backgrounds!
        </p>
        <p>
          Plus, there’s new Gold-purchasable equipment in the Enchanted Armoire, including the
          Match Maker Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy
          :)
        </p>
        <div class="small mb-3">
          by QuartzFox, Alonquain, astigmatism, mewrose, GeraldThePixel, and gawrone
        </div>
        <div class="scene_dailies center-block"></div>
        <h3>February 2020 Resolution Success Challenge and Take This Challenge</h3>
        <p>
          The Habitica team has launched a special official Challenge series hosted in the <a
          href='/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99' target='_blank'>Official New
          Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain
          goals that are destined for success and then stick with them as the year progresses. For
          this month's Challenge, <a href='/challenges/1665c184-eeef-4fef-b68e-bcc12833d26a'>Hone
          Your Weapons</a>, we're focusing on refining and narrowing down your goals to make them
          more achievable! On March 3rd, one lucky winner will receive their choice of 25 Gems or
          a one-month gift subscription, and four additional winners will receive 15 Gems each!
        </p>
        <p>
          Congratulations to the winners of January's Challenge: @MaryanHatch, @AlexGarbus,
          @Feverfew_mole, @shadow-who-walks, and @cyoosh!
        </p>
        <p>
          The next Take This Challenge has also launched, "<a
          href='/challenges/315675bb-8ed8-4226-bda1-7bb058e13b91'>Multiplayer Co-Op Exercise!</a>",
          with a focus on partnering with a friend to work on physical fitness. Be sure to check it
          out to earn additional pieces of the Take This armor set!
        </p>
        <p>
          <a href='http://www.takethis.org/' target='_blank'>Take This</a> is a nonprofit that
          seeks to inform the gamer community about mental health issues, to provide education
          about mental disorders and mental illness prevention, and to reduce the stigma of mental
          illness.
        </p>
        <p>
          Congratulations to the winners of the last Take This Challenge, "Hero's Triumph!": grand
          prize winner @Mythenmetz, and runners-up @copjack, @egroeg0808, @nathgama, @k4m3n, and
          @Abbastract! Plus, all participants in that Challenge have received a piece of the <a
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
