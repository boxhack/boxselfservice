var express = require('express');
var router = express.Router()
var appjs = require('../../app')
var Connection = require('tedious').Connection
var Request = require('tedious').Request
var util = require('util')
const async = require('async')

module.exports = (app) => {
  app.use('/', router)
};

router.get('/cascade', ensureAuthenticated, (req, res) => {
  // var folderId = req.params.folderId;
  var folderId = '0'
  console.log('folderId: ' + folderId)


  appjs.adminAPIClient.enterprise.getUsers({
    filter_term: 'ken.domen.boxdev@nike.com'
  }, (err, data) => {
    if (err) { console.log(err) }
    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id)

    userAPIClient.folders.getItems(folderId, {
      fields: 'name,type,id,owned_by, item_collection, path_collection'
    }, (err, items) => {
      if (err) { console.log(err) }
      var list = []
      getAllItemsForFolderId(folderId, 0, list, userAPIClient)
        .then(items => {
          var result = flattenListForFolders(list)
          var count = 0

          res.render('cascade', {
            error: err,
            errorDetails: util.inspect(err),
            folders: result
          })

        })
    })
  })
})

router.get('/cascade/:id', ensureAuthenticated, (req, res) => {
  var folderId = req.params.id
  console.log('folderId: ' + folderId)

  appjs.adminAPIClient.enterprise.getUsers({
    filter_term: 'ken.domen.boxdev@nike.com'
  }, (err, data) => {
    if (err) { console.log(err) }
    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id)

    userAPIClient.folders.getItems(folderId, {
      fields: 'name,type,id,owned_by'
    }, (err, items) => {
      if (err) { console.log(err) }
      var list = []
      getAllItemsForFolderId(folderId, 0, list, userAPIClient)
        .then(items => {
          var result = flattenListForFolders(list)
          var count = 0

          res.render('cascade', {
            error: err,
            errorDetails: util.inspect(err),
            folders: result
          })
        })
    })
  })
})




router.get('/updateretention', ensureAuthenticated, (req, res) => {
  var folder_name = req.body.folder_name
  var co_owner1 = req.body.co_owner1
  res.redirect('/retention')
})


function ensureAuthenticated (req, res, next) {
  if (req.session.email) {
    return next()
  }
  res.redirect('/auth/box')
}

function flattenListForFolders (list) {
  var result = []
  for (var i = 0; i < list.length; i++) {
    for (var j = 0; j < list[i].length; j++) {
      if (list[i][j].type == 'folder')
        { result.push(list[i][j]) }
    }
  }
  return result
}

function getAllItemsForFolderId (folderId, index, list, client) {
  var LIMIT = 10

  return new Promise(function (resolve, reject) {
    client.folders.getItems(folderId, {
      offset: index,
      limit: LIMIT
    }, function (err, data) {
      if (err) { console.log(err) }
      var nextIndex = index + LIMIT
      list.push(data.entries)

      if (nextIndex < data.total_count) {
        getAllItemsForFolderId(folderId, nextIndex, list, client)
          .then(function () {
            resolve()
          })
      } else {
        resolve()
      }
    })
  })
}
