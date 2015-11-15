// An example file to show how a controller should be structured
let api = {};

api.exampleRoute = {
  method: 'GET',
  url: '/example/:param',
  middlewares: [],
  handler (req, res) {
    res.status(200).send({
      status: 'ok'
    });
  },
};

export default api;