
// Prevent production server from crashing completely
if(process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', function (err) {
        console.error(err);
        console.log("Node NOT Exiting...");
    });
}

require('coffee-script') // remove intermediate compilation requirement
require('./src/server').listen(process.env.PORT || 3000);

// Note: removed "up" module, which is default for development (but interferes with and production + PaaS)
// Restore to 5310bb0 if I want it back (see https://github.com/codeparty/derby/issues/165#issuecomment-10405693)
