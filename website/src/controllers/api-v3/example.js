let api = {};

/**
 * @api {get} /example/:id Request Example information
 * @apiVersion 3.0.0
 * @apiName GetExample
 * @apiGroup Example
 *
 * @apiParam {Number} id Examples unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the Example.
 * @apiSuccess {String} lastname  Lastname of the Example.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 *
 * @apiUse NotFound
 */
api.exampleRoute = {
  method: 'GET',
  url: '/example/:param',
  middlewares: [],
  handler (req, res) {
    res.status(200).send({
      status: 'ok',
    });
  },
};

export default api;
