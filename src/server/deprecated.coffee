express = require 'express'
router = new express.Router()

# ---------- Deprecated Paths ------------

deprecatedMessage = 'This API is no longer supported, see https://github.com/lefnire/habitrpg/wiki/API for new protocol'

router.get '/:uid/up/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.get '/:uid/down/:score?', (req, res) -> res.send(500, deprecatedMessage)
router.post '/users/:uid/tasks/:taskId/:direction', (req, res) -> res.send(500, deprecatedMessage)

module.exports = router
