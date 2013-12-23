/***
 * ---------- /api/v2 API ------------
 * Every url added to router is prefaced by /api/v2
 * Note: Many user-route ops exist in habitrpg-shard/script/index.coffee#user.ops, so that they can (1) be called both
 * client and server.
 * v1 user. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
 * $ mocha test/user.mocha.coffee
 */

var express = require('express');
var router = new express.Router();
var user = require('../controllers/user');
var groups = require('../controllers/groups');
var auth = require('../controllers/auth');
var admin = require('../controllers/admin');
var challenges = require('../controllers/challenges');
var dataexport = require('../controllers/dataexport');
var nconf = require('nconf');
var middleware = require('../middleware');

var cron = user.cron;

router.get('/status', function(req, res) {
  return res.json({
    status: 'up'
  });
});

// ---------------------------------
// User
// ---------------------------------

// List all keys and objects in content.coffee that clients ned to know about
router.get('/content', user.getContent);

// Data Export
router.get('/export/history',auth.auth,dataexport.history); //[todo] encode data output options in the data controller and use these to build routes

// Scoring
router.post('/user/tasks/:id/:direction', auth.auth, cron, user.score);

// Tasks
router.get('/user/tasks', auth.auth, cron, user.getTasks);
router.get('/user/tasks/:id', auth.auth, cron, user.getTask);
router.put('/user/tasks/:id', auth.auth, cron, user.updateTask); //Shared.ops | body={}
router["delete"]('/user/tasks/:id', auth.auth, cron, user.deleteTask); //Shared.ops
router.post('/user/tasks', auth.auth, cron, user.addTask); //Shared.ops | body={}
router.post('/user/tasks/:id/sort', auth.auth, cron, user.sortTask); //Shared.ops | query={to,from}
router.post('/user/tasks/clear-completed', auth.auth, cron, user.clearCompleted); //Shared.ops
router.post('/user/tasks/:id/unlink', auth.auth, challenges.unlink); // removing cron since they may want to remove task first

// Inventory
router.post('/user/inventory/buy/:key', auth.auth, cron, user.buy); // Shared.ops
router.post('/user/inventory/sell/:type/:key', auth.auth, cron, user.sell); // Shared.ops
router.post('/user/inventory/purchase/:type/:key', auth.auth, user.purchase); //Shared.ops
router.post('/user/inventory/feed/:pet/:food', auth.auth, user.feed); //Shared.ops
router.post('/user/inventory/equip/:type/:key', auth.auth, user.equip); //Shared.ops
router.post('/user/inventory/hatch/:egg/:hatchingPotion', auth.auth, user.hatch); //Shared.ops

// User
router.get('/user', auth.auth, cron, user.getUser);
router.put('/user', auth.auth, cron, user.update); // body={}
router['delete']('/user', auth.auth, user['delete']);

router.post('/user/revive', auth.auth, cron, user.revive); // Shared.ops
router.post('/user/reroll', auth.auth, cron, user.reroll); // Shared.ops
router.post('/user/reset', auth.auth, user.reset); // Shared.ops
router.post('/user/sleep', auth.auth, cron, user.sleep); //Shared.opss

router.post('/user/class/change', auth.auth, cron, user.changeClass); //Shared.ops | query={class}
router.post('/user/class/allocate', auth.auth, cron, user.allocate); //Shared.ops | query={stat}
router.post('/user/class/cast/:spell', auth.auth, user.cast);

router.post('/user/unlock', auth.auth, cron, user.unlock); // Shared.ops
router.post('/user/buy-gems', auth.auth, user.buyGems);
router.post('/user/buy-gems/paypal-ipn', user.buyGemsPaypalIPN);

router.post('/user/batch-update', middleware.forceRefresh, auth.auth, cron, user.batchUpdate);

if (nconf.get('NODE_ENV') == 'development') router.post('/user/addTenGems', auth.auth, user.addTenGems);

// Tags
router.post('/user/tags', auth.auth, user.addTag); //Shared.ops | body={}
router.put('/user/tags/:id', auth.auth, user.updateTag); //Shared.ops | body={}
router['delete']('/user/tags/:id', auth.auth, user.deleteTag); //Shared.ops | body={}

// ---------------------------------
// Groups
// ---------------------------------
router.get('/groups', auth.auth, groups.list);
router.post('/groups', auth.auth, groups.create);
router.get('/groups/:gid', auth.auth, groups.get);
router.post('/groups/:gid', auth.auth, groups.attachGroup, groups.update);
router.put('/groups/:gid', auth.auth, groups.attachGroup, groups.update);
//DELETE /groups/:gid

router.post('/groups/:gid/join', auth.auth, groups.attachGroup, groups.join);
router.post('/groups/:gid/leave', auth.auth, groups.attachGroup, groups.leave);
router.post('/groups/:gid/invite', auth.auth, groups.attachGroup, groups.invite);
router.post('/groups/:gid/removeMember', auth.auth, groups.attachGroup, groups.removeMember);
router.post('/groups/:gid/questAccept', auth.auth, groups.attachGroupPopulated, groups.questAccept); // query={key} (optional. if provided, trigger new invite, if not, accept existing invite)
router.post('/groups/:gid/questReject', auth.auth, groups.attachGroupPopulated, groups.questReject);
router.post('/groups/:gid/questAbort', auth.auth, groups.attachGroupPopulated, groups.questAbort);

//GET  /groups/:gid/chat
router.post('/groups/:gid/chat', auth.auth, groups.attachGroup, groups.postChat);
router["delete"]('/groups/:gid/chat/:messageId', auth.auth, groups.attachGroup, groups.deleteChatMessage);
//PUT  /groups/:gid/chat/:messageId

// ---------------------------------
// Members
// ---------------------------------
router.get('/members/:uid', groups.getMember);

// ---------------------------------
// Admin
// ---------------------------------
router.get('/admin/members', auth.auth, admin.ensureAdmin, admin.listMembers);
router.get('/admin/members/:uid', auth.auth, admin.ensureAdmin, admin.getMember);
router.post('/admin/members/:uid', auth.auth, admin.ensureAdmin, admin.updateMember);

// ---------------------------------
// Challenges
// ---------------------------------

// Note: while challenges belong to groups, and would therefore make sense as a nested resource
// (eg /groups/:gid/challenges/:cid), they will also be referenced by users from the "challenges" tab
// without knowing which group they belong to. So to prevent unecessary lookups, we have them as a top-level resource
router.get('/challenges', auth.auth, challenges.list)
router.post('/challenges', auth.auth, challenges.create)
router.get('/challenges/:cid', auth.auth, challenges.get)
router.post('/challenges/:cid', auth.auth, challenges.update)
router['delete']('/challenges/:cid', auth.auth, challenges['delete'])
router.post('/challenges/:cid/close', auth.auth, challenges.selectWinner)
router.post('/challenges/:cid/join', auth.auth, challenges.join)
router.post('/challenges/:cid/leave', auth.auth, challenges.leave)
router.get('/challenges/:cid/member/:uid', auth.auth, challenges.getMember)

module.exports = router;