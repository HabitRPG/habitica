import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'HABITICA BIRTHDAY CELEBRATION, LAST CHANCE FOR WINTER WONDERLAND ITEMS, AND CONTINUED RESOLUTION PLOT-LINE';
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
                <h1 class="align-self-center markdown">${res.t('newStuff')}</h1>
            </div>
        </div>
        <h2>1/30/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>

        <div class="promo_habit_birthday_2018 center-block"></div>

        <h3>Habitica Birthday Party!</h3>
        <p>January 31st is Habitica's Birthday! Thank you so much for being a part of our community - it means a lot.</p>
        <p>Now come join us and the NPCs as we celebrate!</p>

        <h4>Cake for Everybody!</h4>
        <p>In honor of the festivities, everyone has been awarded an assortment of yummy cake to feed to your pets! Plus, for the next two days 
        <a href="/shops/market" target="_blank" rel="noopener">Alexander the Merchant</a> 
        is selling cake in his shop, and cake will sometimes drop when you complete your tasks. Cake works just like normal pet food, 
        but if you want to know what type of pet likes each slice, <a href="http://habitica.wikia.com/wiki/Food" target="_blank" rel="noopener">the wiki has spoilers</a>.
        </p>

        <h4>Party Robes</h4>
        <p>There are Party Robes available for free in the Rewards column! Don them with pride.</p>

        <h4>Birthday Bash Achievement</h4>
        <p>In honor of Habitica's birthday, everyone has been awarded the Habitica Birthday Bash achievement! This achievement stacks for each Birthday Bash you celebrate with us.</p>


        <div class="media">
          <div class="media-body">
            <h3>Last Chance for Frost Sprite Set</h3>
            <p class="markdown">Reminder: this is the final day to <a href="/user/settings/subscription" target="_blank" rel="noopener">subscribe</a> 
            and receive the Frost Sprite Set! Subscribing also lets you buy gems for gold. The longer your subscription, the more gems you get!</p>
            <p>Thanks so much for your support! You help keep Habitica running.</p>
            <div class="small mb-3">by Beffymaroo</div>

            <h3>Last Chance for Starry Night and Holly Hatching Potions</h3>
            <p class="markdown">Reminder: this is the final day to <a href="/shops/market" target="_blank" rel="noopener">buy Starry Night and Holly Hatching Potions!</a> If they come back, it won't be until next year at the earliest, so don't delay!</p>
            <div class="small mb-3">by Vampitch, JinjooHat, Lemoness, and SabreCat</div>

            <h3>Resolution Plot-Line: Broken Buildings</h3>
            <p>Lemoness, SabreCat, and Beffymaroo call an important meeting to address the rumors that are flying about this strange outbreak of Habiticans who are suddenly losing all faith in their ability to complete their New Year's Resolutions.</p>
            <p>“Thank you all for coming,” Lemoness says. “I'm afraid that we have some very serious news to share, but we ask that you remain calm.”</p>
          </div>
          <div class="promo_starry_potions ml-3"></div>
        </div>

        <p>“While it's natural to feel a little disheartened as the end of January approaches,” Beffymaroo says, “these sudden outbreaks appear to have some strange magical origin. 
        We're still investigating the exact cause, but we do know that the buildings where the affected Habiticans live often seem to sustain some damage immediately before the attack.”</p>

        <p>SabreCat clears his throat. “For this reason, we strongly encourage everyone to stay away from broken-down structures, and if you feel any strange tremors or hear odd sounds, 
        please report them immediately.”</p>

        <p class="markdown">“Stay safe, Habiticans.” Lemoness flashes her best comforting smile. 
        “And remember that if your New Year's Resolution goals seem daunting, you can always seek support in the 
        <a href="https://habitica.com/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99" target="_blank" rel="noopener">New Year's Resolution Guild</a>.”</p>

        <p>How mysterious! Hopefully they'll get to the bottom of this soon.</p>

        <hr>
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
      return n.type === 'NEW_STUFF';
    });
    if (existingNotificationIndex !== -1) user.notifications.splice(existingNotificationIndex, 1);
    user.addNotification('NEW_STUFF', { title: LAST_ANNOUNCEMENT_TITLE }, true); // seen by default

    await user.save();
    res.respond(200, {});
  },
};

module.exports = api;