import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'NEW BACKGROUNDS AND ARMOIRE ITEMS, OFFICIAL CHALLENGES, AND FIXES';
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
          <div class="media-body">
            <div class="media">
              <div class="align-self-center mr-3 ${baileyClass}"></div>
              <div class="media-body">
                <h1 class="align-self-center">${res.t('newStuff')}</h1>
              </div>
            </div>
            <h2>2/1/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
            <hr/>
            <h3>February Backgrounds and Armoire Items!</h3>
            <p>We’ve added three new backgrounds to the Background Shop! Now your avatar can dally in a Rose Garden, explore a Magical Museum, and play in Chessboard Land. Check them out under the User Icon > Backgrounds!</p>
            <p>Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the King of Diamonds Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)</p>
            <div class="small mb-3">by AnnDeLune, weeWitch, Katy133, RandomGryffindor, and Chimera Liani</div>
          </div>
          <div class="promo_armoire_backgrounds_201802 m1-3 mb-3"></div>
        </div>

        <div class="media">
          <div class="scene_yesterdailies_repeatables mr-3"></div>
          <div class="media-body">
            <h3>February 2018 Resolution Success Challenge and Take This Challenge</h3>
            <p>The Habitica team has launched a special official Challenge series hosted in the <a href="/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99">Official New Year's Resolution Guild</a>. These Challenges are designed to help you build and maintain goals that are destined for success and then stick with them as the year progresses. For this month's Challenge, <a href="/challenges/2836b401-a11d-4fe9-a75f-77c1e9d31ba4">Hone your Weapons</a>, we're focusing on making sure the goals you've set this year are specific and achievable! It has a 15 Gem prize, which will be awarded to five lucky winners on March 1st.</p>
          </div>
        </div>
        <p>Congratulations to the winners of January's Challenge: upsidedawn, Cristalias, feistyturtle, Yachiie, and Stijn Verwijmeren!</p>
        <div class="media">
          <div class="media-body">
            <p>The next Take This Challenge has also launched, <a href="/challenges/75a06666-b0c0-4fec-b612-ef5bebe74bfb">Cast of Characters!</a>, with a focus on imagining one's positive and negative feelings as characters in a story. Be sure to check it out to earn additional pieces of the Take This armor set!</p>
            <p><a href="http://www.takethis.org" target="_blank">Take This</a> is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.</p>
          </div>
          <div class="promo_take_this ml-3"></div>
        </div>
        <p>Congratulations to the winners of the last Take This Challenge, 'Check Your HP!': grand prize winner PoNyasha, and runners-up -ᏲᎾ-, Kat Thompson, 𝒮𝔲𝔠𝔥𝔢𝔯𝔪𝔞𝔲𝔰 🐭, Cal_Fizz, and redfeather! Plus, all participants in that Challenge have received a piece of the <a href="http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set" target="_blank">Take This item set</a> if they hadn't completed the set already. Armor pieces are located in your Rewards column. Enjoy!</p>
        <div class="small mb-3">by Doctor B, the Take This team, Lemoness, Beffymaroo, and SabreCat</div>
        <h3>Updates and Fixes</h3>
        <p>We've made a number of fixes, most prominently a bunch of fixes for notifications so that they direct you to the correct place when clicked and disappear after that!</p>
        <p>We've also fixed the issue where some Habiticans were seeing old announcements from Bailey rather than the latest ones, and we've added a way for Group Plan managers to note when an assigned task needs further work from the assignee.</p>
        <p>We hope these fixes improve your Habitica experience!</p>
        <div class="small mb-3">by Paglias, TheHollidayInn, and Apollo</div>

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
