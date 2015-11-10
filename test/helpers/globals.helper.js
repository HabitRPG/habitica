require('babel/register');
//------------------------------
// Global modules
//------------------------------

global._ = require("lodash")
global.chai = require("chai")
global.sinon = require("sinon");
chai.use(require("sinon-chai"))
chai.use(require("chai-as-promised"));
global.expect = chai.expect
global.sandbox = sinon.sandbox.create();

//------------------------------
// Load nconf for unit tests
//------------------------------
require('../../website/src/libs/api-v3/setupNconf')('./config.json.example');
