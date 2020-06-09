var express = require('express')
var router = express.Router()

var appjs = require('../../app')
var Connection = require('tedious').Connection
var Request = require('tedious').Request
var util = require('util')
const async = require('async')

module.exports = (app) => {
  app.use('/', router)
};

router.get('/metadata', ensureAuthenticated, (req, res) => {
  getAllTemplates(req, res)
})

router.get('/template', ensureAuthenticated, (req, res) => {
  getTemplate(req, res)
})

router.get('/createtemplate', ensureAuthenticated, (req, res) => {
  res.render('createtemplate')
})

router.post('/savetemplate', ensureAuthenticated, (req, res) => {
  var name = req.body.name
  var templateKey = req.body.templateKey
  var status = req.body.status == 'hidden';

  appjs.adminAPIClient.metadata
    .createTemplate(
      name,
      [
        {
          type: req.body.paramFormat,
          key: req.body.paramKey,
          displayName: req.body.paramName
        }
      ],
      { hidden: status, templateKey: templateKey }
    )
    .then((template) => {
      res.json({ success: true })
    })
    .catch((err) => {
      console.log(err)
    })
})

function getAllTemplates (req, res) {
  appjs.adminAPIClient.metadata
    .getTemplates('enterprise')
    .then((templates) => {
      // add template visible attributes
      templates.entries.forEach((template) => {
        count = 0
        template.fields.forEach((field) => {
          if (!field.hidden) {
            count++
          }
        })
        template.visibleFields = count
      })

      res.render('metadata', {
        templates: templates.entries
      })
    })
    .catch((err) => {
      res.render('metadata', {
        error: err,
        templates: templates
      })
    })
}

function getTemplate (req, res) {
  appjs.adminAPIClient.metadata
    .getTemplateSchema('enterprise', req.query.id)
    .then((template) => {
      res.render('template', {
        template: template
      })
    })
}

function ensureAuthenticated (req, res, next) {
  if (req.session.email) {
    return next()
  }
  res.redirect('/auth/box')
}
