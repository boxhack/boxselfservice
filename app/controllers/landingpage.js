var express = require('express'),
  router = express.Router();

var appjs = require('../../app');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/landingpage', ensureAuthenticated, function (req, res) {
  // If you have access level logic, put it here...
  res.render('landingpage')
});

function ensureAuthenticated(req, res, next) {
  if (req.session.email) { return next(); }
  res.redirect('/auth/box')
}