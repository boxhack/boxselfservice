var express = require('express'),
  router = express.Router();

var appjs = require('../../app');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var util = require('util');
const async = require('async');


module.exports = (app) => {
  app.use('/', router);
};


router.get('/metadata', ensureAuthenticated, (req, res) => {
  getAllTemplates(req, res)
});

router.get('/template', ensureAuthenticated, (req, res) => {
  getTemplate(req, res)
});



function getAllTemplates(req, res) {
  appjs.adminAPIClient.metadata.getTemplates('enterprise')
    .then(templates => {

      // add template visible attributes 
      templates.entries.forEach(template => {
        count = 0;
        template.fields.forEach(field => {
            if (!field.hidden)
              count++;
        });
        template.visibleFields = count
      });

      res.render('metadata', {
        templates: templates.entries
      });
    }).catch(err => {
      res.render('metadata', {
        error: err,
        templates: templates
      });
    })

}

function getTemplate(req, res) {
  appjs.adminAPIClient.metadata.getTemplateSchema('enterprise', req.query.id)
    .then(template => {
      res.render('template', {
        template: template
      });
    });
}

function ensureAuthenticated(req, res, next) {
  if (req.session.email) {
    return next();
  }
  res.redirect('/auth/box')
}