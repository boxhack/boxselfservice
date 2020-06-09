var express = require('express')
var router = express.Router()

var appjs = require('../../app')
var Connection = require('tedious').Connection
var Request = require('tedious').Request
var util = require('util')

module.exports = (app) => {
  app.use('/', router)
}

router.get('/createfolders', ensureAuthenticated, (req, res) => {
  appjs.adminAPIClient.enterprise.getUsers({ filter_term: 'a.NikeTeamsProjects@nike.com' }, (err, data) => {
    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id)

    userAPIClient.folders.getItems('0', null, (err, userdata) => {
      if (err) { console.log(err) }
      res.render('createfolders', {
        error: err,
        errorDetails: util.inspect(err),
        files: userdata ? userdata.entries : [],
        root: data ? data.entries : []
      })
    })
  })
})

router.post('/createfolders', ensureAuthenticated, (req, res) => {
  var folder_name = req.body.folder_name
  var co_owner1 = req.body.co_owner1
  var co_owner2 = req.body.co_owner2
  var parent_folder_id = req.body.parent_folder_id
  var parent_folder_owner = req.body.parent_folder_owner

  appjs.adminAPIClient.enterprise.getUsers({ filter_term: parent_folder_owner }, (err, data) => {
    var userClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id)
    userClient.folders.create('0', folder_name, (err, data) => {
      if (err) { console.log(err) }
      var newFolderId = data.id
      userClient.collaborations.createWithUserEmail(co_owner1, newFolderId, userClient.collaborationRoles.CO_OWNER, (err, data) => {
      })
      userClient.collaborations.createWithUserEmail(co_owner2, newFolderId, userClient.collaborationRoles.CO_OWNER, (err, data) => {
      })

      res.redirect('/createfolders')
    })
  })
})

function ensureAuthenticated (req, res, next) {
  if (req.session.email) { return next() }
  res.redirect('/auth/box')
}
