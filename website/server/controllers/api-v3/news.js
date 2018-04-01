import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'APRIL FOOL\'S 2018: TINY PETS AND MOUNTS!';
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
        <h2>4/1/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
        <hr/>
        <div class="media align-items-center">
          <div class="media-body">
            <h3>Tiny Pets and Mounts</h3>
            <p>Oh no! That dastardly April Fool seems to have pulled off his "small" prank: all our pets and mounts have shrunk!</p>
            <p>"Haha!" the April Fool laughs as he bursts in the the Tavern, "Enjoy your new and more efficiently-sized friends! Now your pets and mounts are so much easier to keep track of, right? This should certainly increase your productivity!"</p>
          </div>
          <div class="npc_aprilFool"></div>
        </div>
        <p>Lady Glaciate grumbles from her corner table and looks at her mammoth, which is happily cavorting in her teacup. "Well, since I don't have a ride back home to the Stoikalm Steppes at the moment, I disagree."</p>
        <p>As Sir Stomp sprays tea triumphantly from his trunk, a small smile tugs at the corner of her mouth. ".…I suppose one could argue it's quite cute, though," she grudgingly adds.</p>
        <p>It looks like all our pets and mounts are extra small for the time being. Enjoy the fun by checking out everyone's profiles today! Your pets and mounts will return to normal on April 3.</p>
        <h3>Special April Fool's Social Media Challenge!</h3>
        <p>For even more fun, check out the <a href='/challenges/a7cacfb6-3135-4d17-9a51-46dfcfe1e712' target='_blank'>official Challenge</a> posted especially for today! Share your avatar featuring your tiny pets on social media between now and April 3, and you'll have a chance to win gems!</p>
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
