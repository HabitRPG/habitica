import mongoose from 'mongoose';

let api = {};

let tasksModels = ['habit', 'daily', 'todo', 'reward'];
let allModels = ['user', 'tag', 'challenge', 'group'].concat(tasksModels);

/**
 * @api {get} /api/v3/meta/models/:model/paths Get all paths for the specified model. Doesn't require authentication
 * @apiVersion 3.0.0
 * @apiName GetUserModelPaths
 * @apiGroup Meta
 *
 * @apiParam {string="user","group","challenge","tag","habit","daily","todo","reward"} model The name of the model
 *
 * @apiSuccess {object} paths A key-value object made of fieldPath: fieldType (like {'field.nested': Boolean})
 */
api.getModelPaths = {
  method: 'GET',
  url: '/meta/models/:model/paths',
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
