import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'THE APRIL FOOL STRIKES AGAIN!';
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
            <h2>4/1/2019 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_april_fools_2019 center-block"></div>
        <h3>Fruit and Veggie Pets and NPCs</h3>
        <p>The April Fool has appeared, and he's got a farmer's market's worth of produce in tow.</p>
        <p>"HAHA!" he cries, as a dragonfruit bounces along beside him. "I've always thought good humor should be healthful and nourishing, so I've gone back to my roots, if you will, to bring some plant-powered goodness into Habitica once again!"</p>
        <p>"He's replaced all our equipped pets with fruits and vegetables!" says QuartzFox, gently patting a contented-looking tomato. "Although to be fair, they are very cute fruits and vegetables!"</p>
        <p>Equipping different pets will show different fruits and veggies. Have fun discovering them all!</p>
        <p>The NPCs have also been turned into their fruit and vegetable forms as a tribute to Habitica's <a href="https://habitica.fandom.com/wiki/April_Fools'_Day_2014" target='_blank'>very first April Fool's prank back in 2014</a>! Go check them out.</p>
        <h3>Special April Fool's Social Media Challenge!</h3>
        <p>For even more fun, check out the <a href='/challenges/b0337534-ec69-4269-8cc6-f74c91881451'>official Challenge</a> posted especially for today! Share your avatar featuring your new fruit and veggie pet on social media between now and April 3, and you'll have a chance to win gems and have your avatar featured on the Habitica Blog!</p>
        <div class="small mb-3">by Beffymaroo, SabreCat, Piyo, Viirus, and Lemoness</div>
        <div class="npc_aprilFool center-block"></div>
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
