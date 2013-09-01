var express = require('express');
var router = new express.Router();
var user = require('../controllers/user');
var groups = require('../controllers/groups');

/*
  ---------- /api/v1 API ------------
  Every url added to router is prefaced by /api/v1
  See ./routes/coffee for routes

  v1 user. Requires x-api-user (user id) and x-api-key (api key) headers, Test with:
  $ cd node_modules/racer && npm install && cd ../..
  $ mocha test/user.mocha.coffee
*/

var auth = user.auth
var verifyTaskExists = user.verifyTaskExists
var cron = user.cron;

router.get('/status', function(req, res) {
  return res.json({
    status: 'up'
  });
});

/* Auth*/
router.post('/register', user.registerUser);

/* Scoring*/
router.post('/user/task/:id/:direction', auth, cron, user.scoreTask);
router.post('/user/tasks/:id/:direction', auth, cron, user.scoreTask);

/* Tasks*/
router.get('/user/tasks', auth, cron, user.getTasks);
router.get('/user/task/:id', auth, cron, user.getTask);
router.put('/user/task/:id', auth, cron, verifyTaskExists, user.updateTask);
router.post('/user/tasks', auth, cron, user.updateTasks);
router["delete"]('/user/task/:id', auth, cron, verifyTaskExists, user.deleteTask);
router.post('/user/task', auth, cron, user.createTask);
router.put('/user/task/:id/sort', auth, cron, verifyTaskExists, user.sortTask);
router.post('/user/clear-completed', auth, cron, user.clearCompleted);

/* Items*/
router.post('/user/buy/:type', auth, cron, user.buy);

/* User*/
router.get('/user', auth, cron, user.getUser);
router.post('/user/auth/local', user.loginLocal);
router.post('/user/auth/facebook', user.loginFacebook);
router.put('/user', auth, cron, user.updateUser);
router.post('/user/revive', auth, cron, user.revive);
router.post('/user/batch-update', auth, cron, user.batchUpdate);
router.post('/user/reroll', auth, cron, user.reroll);
router.post('/user/buy-gems', auth, user.buyGems);

/* Groups*/
router.get('/groups', auth, groups.getGroups);
//TODO:
//GET /groups/:gid (get group)
//POST /groups/:gid (create group)
//PUT /groups/:gid (edit group)
//DELETE /groups/:gid

router.post('/groups/:gid/join', auth, groups.attachGroup, groups.join);
router.post('/groups/:gid/leave', auth, groups.attachGroup, groups.leave);
router.post('/groups/:gid/invite', auth, groups.attachGroup, groups.invite);

//GET  /groups/:gid/chat
router.post('/groups/:gid/chat', auth, groups.attachGroup, groups.postChat);
//PUT  /groups/:gid/chat/:messageId
//DELETE  /groups/:gid/chat/:messageId



module.exports = router;