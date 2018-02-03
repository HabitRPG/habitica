import mongoose from 'mongoose';

let api = {};

let tasksModels = ['habit', 'daily', 'todo', 'reward'];
let allModels = ['user', 'tag', 'challenge', 'group'].concat(tasksModels);

/**
 * @api {get} /api/v3/models/:model/paths Get all paths for the specified model
 * @apiDescription Doesn't require authentication
 * @apiName GetUserModelPaths
 * @apiGroup Meta
 *
 * @apiParam (Path) {String="user","group","challenge","tag","habit","daily","todo","reward"} model The name of the model
 *
 * @apiExample {curl} Tag
 * curl https://habitica.com/api/v3/models/tag/paths
 *
 * @apiSuccess {Object} data A key-value object made of fieldPath: fieldType (like {'field.nested': Boolean})
 *
 * @apiSuccessExample {json} Tag
 * {
 *   "success":true,
 *   "data": {
 *     "id":"String",
 *     "name":"String",
 *     "challenge":"String"
 *   }
 * }
 *
 * @apiError (400) {badRequest} modelNotFound The model specified was not found
 */
api.getModelPaths = {
  method: 'GET',
  url: '/models/:model/paths',
  async handler (req, res) {
    req.checkParams('model', res.t('modelNotFound')).notEmpty().isIn(allModels);

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let model = req.params.model;
    // tasks models are lowercase, the others have the first letter uppercase (User, Group)
    if (tasksModels.indexOf(model) === -1) {
      model = model.charAt(0).toUpperCase() + model.slice(1);
    }

    model = mongoose.model(model);

    res.respond(200, model.getModelPaths());
  },
};

module.exports = api;
