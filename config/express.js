var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var exphbs = require('express-handlebars');
var moment = require('moment');

module.exports = function (app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.engine('handlebars', exphbs({
    layoutsDir: config.root + '/app/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [config.root + '/app/views/partials/'],
    helpers: {
      toJSON: function (object) {
        return JSON.stringify(object);
      },
      minusDomain: function (object) {
        if (object.indexOf("@") > 0)
          return object.substring(0, object.indexOf("@"))
        return object;
      },
      prettifyDate: function (timestamp) {
        var d = new Date(0);
        d.setUTCSeconds(timestamp);
        //var res = d.toString('yyyy-MM-dd HH:mm:ss');
        var res = moment(d, 'yyyy-MM-dd HH:mm:ss+07:00');
        //console.log(res.format());
        return res.format();
      },
      hasKey: function (object) {
        console.log("yes!");
        return object.hasOwnProperty("created_by");
      },
      if_eq: function (a, b, opts) {  // https://stackoverflow.com/questions/15088215/handlebars-js-if-block-helper
        if (a == b) // Or === depending on your needs
          return opts.fn(this);
        else
          return opts.inverse(this);
      }
    }
  }));
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');


  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });

  return app;
};
