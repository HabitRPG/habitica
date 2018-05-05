let api = {};

api.redirectProfileQRCode = {
  method: 'GET',
  url: '/qr-code/user/:memberid',
  runCron: false,
  async handler (req, res) {
    req.checkParams('memberid', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    res.redirect(301, `/static/front/#?memberId=${req.params.memberid}`);
  },
};

module.exports = api;
