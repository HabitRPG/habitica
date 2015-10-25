//------------------------------
// Global modules
//------------------------------

global._ = require("lodash")
global.chai = require("chai")
chai.use(require("sinon-chai"))
chai.use(require("chai-shallow-deep-equal"));
chai.use(require("chai-as-promised"));
global.expect = chai.expect
