// DEPRECATED BUT STILL ACTIVE

// import path from 'path';
// import swagger from 'swagger-node-express';
// import shared from '../../../../common';
import express from 'express';

const v2app = express();

// re-set the view options because they are not inherited from the top level app
v2app.set('view engine', 'jade');
v2app.set('views', `${__dirname}/../../../views`);

// Custom Directives
// v2app.use('/', require('../../routes/api-v2/auth'));
// v2app.use('/', require('../../routes/api-v2/coupon'));
// v2app.use('/', require('../../routes/api-v2/unsubscription'));

// const v2routes = express();
// v2app.use('/api/v2', v2routes);
// v2app.use('/export', require('../../routes/dataexport'));
// require('../../routes/api-v2/swagger')(swagger, v2);

// v2app.use(require('../api-v2/errorHandler'));

module.exports = v2app;
