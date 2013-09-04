var express = require('express');
var router = new express.Router();
var user = require('../controllers/user');
var groups = require('../controllers/groups');
var auth = require('../controllers/auth');

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

/* Items*/
router.post('/user/buy/:type', auth.auth, cron, user.buy);

/* User*/
router.get('/user', auth.auth, cron, user.getUser);
router.put('/user', auth.auth, cron, user.updateUser);
router.post('/user/revive', auth.auth, cron, user.revive);
router.post('/user/batch-update', auth.auth, cron, user.batchUpdate);
router.post('/user/reroll', auth.auth, cron, user.reroll);
router.post('/user/buy-gems', auth.auth, user.buyGems);

/* Groups*/
router.get('/groups', auth.auth, groups.getGroups);
router.post('/groups', auth.auth, groups.createGroup);
//TODO:
//GET /groups/:gid (get group)
//PUT /groups/:gid (edit group)
//DELETE /groups/:gid

router.post('/groups/:gid/join', auth.auth, groups.attachGroup, groups.join);
router.post('/groups/:gid/leave', auth.auth, groups.attachGroup, groups.leave);
router.post('/groups/:gid/invite', auth.auth, groups.attachGroup, groups.invite);

//GET  /groups/:gid/chat
router.post('/groups/:gid/chat', auth.auth, groups.attachGroup, groups.postChat);
//PUT  /groups/:gid/chat/:messageId
//DELETE  /groups/:gid/chat/:messageId



module.exports = router;