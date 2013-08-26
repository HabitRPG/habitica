var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

app.configure(function() {
  app.set("port", 3003);
  app.set("views", "" + __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.logger());
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express["static"](path.join(__dirname, "app")));
});

Error.stackTraceLimit = Infinity;

app.configure("development", function() {
  return app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'));
