"use strict";

var _config$app, _config$app2, _config$app3, _config$app4, _config$app5;
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var requestMiddleware = require("./middlewares/validateRequestMiddleware");
var cacheMiddleware = require("./middlewares/cacheMiddleware");
var NodeCache = require("node-cache");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var config = require("./config");
var musterRouter = require("./routes/muster");
var authRouter = require("./routes/auth");
var userRouter = require("./routes/userV1");
var mdmsRouter = require("./routes/mdmsV1");
var persisterRouter = require("./routes/persisterV1");
var searcherRouter = require("./routes/searcher");
var _require = require("./kafka/consumer"),
  listenConsumer = _require.listenConsumer;
var _require2 = require("./utils"),
  getErrorResponse = _require2.getErrorResponse,
  invalidPathHandler = _require2.invalidPathHandler,
  errorLogger = _require2.errorLogger,
  errorResponder = _require2.errorResponder,
  throwError = _require2.throwError;
var _require3 = require("./database"),
  initialiseTables = _require3.initialiseTables;
var dataConfigUrls = config.configs.DATA_CONFIG_URLS;
var formatConfigUrls = config.configs.DATA_CONFIG_URLS;
var dataConfigMap = {};
var formatConfigMap = {};
var app = express();
app.disable("x-powered-by");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
initialiseTables();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express["static"](path.join(__dirname, "../public")));
/* Middleware to Validate Request info */
app.use(requestMiddleware);

/* Middleware to cache response */
app.use(cacheMiddleware);
app.use(((_config$app = config.app) === null || _config$app === void 0 ? void 0 : _config$app.contextPath) + "/muster", musterRouter);
app.use(((_config$app2 = config.app) === null || _config$app2 === void 0 ? void 0 : _config$app2.contextPath) + "/auth", authRouter);
app.use(((_config$app3 = config.app) === null || _config$app3 === void 0 ? void 0 : _config$app3.contextPath) + "/user/v1", userRouter);
app.use(((_config$app4 = config.app) === null || _config$app4 === void 0 ? void 0 : _config$app4.contextPath) + "/persister/v1", persisterRouter);
app.use(((_config$app5 = config.app) === null || _config$app5 === void 0 ? void 0 : _config$app5.contextPath) + "/mdms/v1", mdmsRouter);
app.use(config.app.contextPath + "/searcher", searcherRouter);

// Attach the first Error handling Middleware
// function defined above (which logs the error)
app.use(errorLogger);

// Attach the second Error handling Middleware
// function defined above (which sends back the response)
app.use(errorResponder);

// Attach the fallback Middleware
// function which sends back the response for invalid paths)
app.use(invalidPathHandler);
listenConsumer();
module.exports = app;