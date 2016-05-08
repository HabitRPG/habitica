// DEPRECATED BUT STILL ACTIVE

// import path from 'path';
import swagger from 'swagger-node-express';
// import shared from '../../../../common';
import express from 'express';
import analytics from './analytics';
import responseHandler from './response';

const v2app = express();

// re-set the view options because they are not inherited from the top level app
v2app.set('view engine', 'jade');
v2app.set('views', `${__dirname}/../../../views`);

v2app.use(analytics);
v2app.use(responseHandler);


// Custom Directives
v2app.use('/', require('../../routes/api-v2/auth'));
// v2app.use('/', require('../../routes/api-v2/coupon')); // TODO REMOVE - ONLY v3
// v2app.use('/', require('../../routes/api-v2/unsubscription')); // TODO REMOVE - ONLY v3

require('../../routes/api-v2/swagger')(swagger, v2app);

v2app.use(require('../api-v2/errorHandler'));

module.exports = v2app;
