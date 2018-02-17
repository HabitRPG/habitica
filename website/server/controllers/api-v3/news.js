import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'WORLD BOSS: THE DYSHEARTENER IS UNLEASHED';
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
        <h2>2/14/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <p>Oh no, a World Boss is attacking Habitica! Head to the Tavern to see it now. If you're on mobile, make sure that you have the latest versions downloaded to get the full experience!</p>
        <div class="promo_dysheartener center-block"></div>
        <p class="text-center">~*~</p>
        <p>The sun is rising on Valentine's Day when a shocking crash splinters the air. A blaze of sickly pink light lances through all the buildings, and bricks crumble as a deep crack rips through Habit City's main street. An unearthly shrieking rises through the air, shattering windows as a hulking form slithers forth from the oozing earth.</p>
        <p>Mandibles snap and a carapace glitters; legs upon legs unfurl in the air. The crowd begins to scream as the insectoid creature rears up, revealing itself to be none other than that cruelest of creatures: the fearsome Dysheartener itself. It howls in anticipation and lunges forward, hungering to gnaw on the hopes of hard-working Habiticans. With each rasping scrape of its spiny forelegs, you feel a vise of despair tightening in your chest.</p>
        <p>"Take heart, everyone!" Lemoness shouts. "It probably thinks that we're easy targets because so many of us have daunting New Year's Resolutions, but it's about to discover that Habiticans know how to stick to their goals!"</p>
        <p>AnnDeLune raises her staff. "Let's tackle our tasks and take this monster down!"</p>
        <p class="text-center">~*~</p>
        <p>Complete Habits, Dailies and To-Dos to damage the World Boss! Incomplete Dailies fill the Rage Strike Bar. When the Rage Strike bar is full, the World Boss will attack one of Habitica's shopkeepers. A World Boss will never damage individual players or accounts in any way. Only active accounts who are not resting in the Inn will have their incomplete Dailies tallied.</p>
        <p>*If you’d prefer not to see the World Boss due to a phobia, check out the <a href="http://habitica.wikia.com/wiki/Phobia_Protection_Extension" target="_blank">Phobia Protection Extension</a> (and set it to hide “Beetles”) :)</p>
        <div class="small">by Lemoness, Beffymaroo, SabreCat, viirus, Apollo, and piyorii</div>
        <div class="small">Art by AnnDeLune, Lemoness, and Beffymaroo</div>
        <div class="small">Written by Lemoness</div>
        <div class="small">Phobia Protection Extension by Alys</div>

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
