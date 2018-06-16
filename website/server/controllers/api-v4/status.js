let api = {};

api.getStatus = {
  method: 'GET',
  url: '/status',
  async handler (req, res) {
    res.respond(200, {
      status: 'v4 is up',
    });
  },
};

module.exports = api;
