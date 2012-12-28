var forever = require('forever-monitor');
var child = new (forever.Monitor)('server.js');

child.on('exit', function () {
    console.log('server.js has exited after 10 restarts');
});

child.start();