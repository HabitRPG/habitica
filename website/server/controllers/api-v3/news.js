import { authWithHeaders } from '../../middlewares/auth';

let api = {};

// @TODO export this const, cannot export it from here because only routes are exported from controllers
const LAST_ANNOUNCEMENT_TITLE = 'FALL FESTIVAL AVATAR CUSTOMIZATIONS AND USERNAME FAQS';
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
            <h2>10/11/2018 - ${LAST_ANNOUNCEMENT_TITLE}</h2>
          </div>
        </div>
        <hr/>
        <div class="promo_fall_avatar_customizations center-block"></div>
        <h3>Supernatural Skins & Haunted Hair Colors</h3>
        <p>The Seasonal Edition Haunted Hair Colors are now available for purchase! Now you can dye your avatar's hair Pumpkin, Midnight, Candy Corn, Ghost White, Zombie, or Halloween. They’ll vanish after October 31, so be sure to check them out!</p>
        <p>The Supernatural Skin Set is also available until October 31st! Now your avatar can become an Ogre, Skeleton, Pumpkin, Candy Corn, Reptile, or Dread Shade.</p>
        <p>Seasonal Edition items recur unchanged every year, but they are only available to purchase during a short period of time. Find these exciting skins and hair colors in User>Edit Avatar. Get them now, or you'll have to wait until next year!</p>
        <div class="small mb-3">by Lemoness, mariahm, and crystalphoenix</div>
        <div class="scene_nametag center-block"></div>
        <h3>Unique Usernames Update and FAQ</h3>
        <p>It’s been a week since we announced the switch to unique usernames. So far, around half of active Habiticans have confirmed their usernames and are ready to go. Be sure to go to <a href="/user/settings/site" target="_blank">Settings</a> and confirm yours!</p>
        <p>We’ve seen a few questions floating around the community and wanted to provide some clarification about the change:</p>
        <ul>
          <li><strong>Usernames will appear beside your display name</strong> in chats and your profile</li>
          <li><strong>Usernames must be unique</strong> to be sure you’re inviting or messaging the right person</li>
          <li><strong>Display names aren’t unique</strong>, and two people can have the same one. Your display name can be the same as or different than your username.</li>
          <li><strong>You can change your display name and username at any time</strong>, even after confirmation</li>
          <li><strong>Changes to chat and invitations will roll out gradually</strong> after about a month</li>
        </ul>
        <p>If you want to read a more in-depth Q&A on this change and see an example to show how it will work, please <a href="https://habitica.wordpress.com/2018/10/11/coming-soon-unique-usernames/" target="_blank">visit our blog</a>!</p>
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
