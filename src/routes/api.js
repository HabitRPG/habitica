var express = require('express');
var router = new express.Router();
var user = require('../controllers/user');
var groups = require('../controllers/groups');
var auth = require('../controllers/auth');
var challenges = require('../controllers/challenges');

/*
 ---------- /api/v1 API ------------
 Every url added to router is prefaced by /api/v1
 See ./routes/coffee for routes

 v1 user. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
 $ cd node_modules/racer && npm install && cd ../..
 $ mocha test/user.mocha.coffee
 */

var verifyTaskExists = user.verifyTaskExists
var cron = user.cron;

router.get('/status', function(req, res) {
  return res.json({
    status: 'up'
  });
});

/* Scoring*/
router.post('/user/task/:id/:direction', auth.auth, cron, user.scoreTask);
router.post('/user/tasks/:id/:direction', auth.auth, cron, user.scoreTask);

/* Tasks*/
router.get('/user/tasks', auth.auth, cron, user.getTasks);
router.get('/user/task/:id', auth.auth, cron, user.getTask);
router.put('/user/task/:id', auth.auth, cron, verifyTaskExists, user.updateTask);
router.post('/user/tasks', auth.auth, cron, user.updateTasks);
router["delete"]('/user/task/:id', auth.auth, cron, verifyTaskExists, user.deleteTask);
router.post('/user/task', auth.auth, cron, user.createTask);
router.put('/user/task/:id/sort', auth.auth, cron, verifyTaskExists, user.sortTask);
router.post('/user/clear-completed', auth.auth, cron, user.clearCompleted);
router.post('/user/task/:id/unlink', auth.auth, challenges.unlink); // removing cron since they may want to remove task first
if (process.env.NODE_ENV == 'development') {
  router.post('/user/addTenGems', auth.auth, user.addTenGems);
}

/* Items*/
router.post('/user/buy/:type', auth.auth, cron, user.buy);

/* User*/
router.get('/user', auth.auth, cron, user.getUser);
router.put('/user', auth.auth, cron, user.updateUser);
router.post('/user/revive', auth.auth, cron, user.revive);
router.post('/user/batch-update', auth.auth, cron, user.batchUpdate);
router.post('/user/reroll', auth.auth, cron, user.reroll);
router.post('/user/buy-gems', auth.auth, user.buyGems);
router.post('/user/buy-gems/paypal-ipn', user.buyGemsPaypalIPN);
router.post('/user/unlock', auth.auth, cron, user.unlock);
router.post('/user/reset', auth.auth, user.reset);
router['delete']('/user', auth.auth, user['delete']);

/* Tags */
router['delete']('/user/tags/:tid', auth.auth, user.deleteTag);

/* Groups*/
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

//GET  /groups/:gid/chat
router.post('/groups/:gid/chat', auth.auth, groups.attachGroup, groups.postChat);
router["delete"]('/groups/:gid/chat/:messageId', auth.auth, groups.attachGroup, groups.deleteChatMessage);
//PUT  /groups/:gid/chat/:messageId

/* Members */
router.get('/members/:uid', groups.getMember);

// Market
router.post('/market/buy', auth.auth, user.marketBuy);

/* Challenges */
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