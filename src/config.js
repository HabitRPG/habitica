/* Load nconf and define default configuration values if config.json or ENV vars are not found*/


var conf = require("nconf");
var path = require("path");

conf.argv()
  .env()
  //.file('defaults', path.join(path.resolve(__dirname, '../config.json.example')))
  .file('user', path.join(path.resolve(__dirname, '../config.json')));

/*
var agent;
if (process.env.NODE_ENV === 'development') {
    // Follow these instructions for profiling / debugging leaks
    // * https://developers.google.com/chrome-developer-tools/docs/heap-profiling
    // * https://developers.google.com/chrome-developer-tools/docs/memory-analysis-101
    agent = require('webkit-devtools-agent');
    console.log("To debug memory leaks:" +
        "\n\t(1) Run `kill -SIGUSR2 " + process.pid + "`" +
        "\n\t(2) open http://c4milo.github.com/node-webkit-agent/21.0.1180.57/inspector.html?host=localhost:1337&page=0");
}
*/


if (conf.get('NODE_ENV') === "development") {
  Error.stackTraceLimit = Infinity;
}
