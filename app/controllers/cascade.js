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



var EMAIL = 'ken.domen.boxdev@nike.com'
var TEMPLATE = 'folderretention'

router.post('/cascadeupdate', ensureAuthenticated, (req, res) => {
  console.log("folderId: " + req.body.id)

    async.waterfall([
      function (callback) {
        appjs.adminAPIClient.folders.get(folderId)
          .then(folder => {
            callback(null, folder.name, folder.owned_by, folder.path_collection)
          })
      },
      // TODO...
      /** 
      getOrCreateCascadePolicy,
      getOrCreateMetadataValue,
      force*/
    ], function (err, name, owner, policy) {
      if (err) { console.log(err) }
      res.json({
        name: name,
        owner: owner,
        policy: policy
      })
    })
  
})


function getUserClient (adminAPIClient, email, folderId, value, callback) {
  adminAPIClient.enterprise.getUsers({
    filter_term: email
  }, function (err, users) {
    console.log(err)
    var userClient = sdk.getAppAuthClient('user', users.entries[0].id)
    callback(null, userClient, folderId, value)
  })
}

function getOrCreateCascadePolicy (userClient, folderId, value, callback) {
  userClient.metadata.getCascadePolicies(folderId)
    .then(cascadePolicies => {
      var policyID = null
      if (cascadePolicies.entries.length > 0) {
        console.log('found cascade policy...')
        policyID = cascadePolicies.entries[0].id
        callback(null, userClient, folderId, value, policyID)
      } else {
        userClient.metadata.createCascadePolicy('enterprise', TEMPLATE, folderId)
          .then(cascadePolicy => {
            console.log('creating cascadePolicy...')
            callback(null, userClient, folderId, value, cascadePolicy.id)
          })
      }
    })
}

function getOrCreateMetadataValue (userClient, folderId, value, policyId, callback) {
  userClient.folders.getMetadata(folderId, userClient.metadata.scopes.ENTERPRISE, TEMPLATE)
    .then(metadata => {
      console.log(metadata)
      // found so UPDATE
      var updates = [{
        op: 'add',
        path: '/year',
        value: value
      }]
      userClient.folders.updateMetadata(folderId, userClient.metadata.scopes.ENTERPRISE, TEMPLATE, updates)
        .then(metadata => {
          callback(null, userClient, folderId, value, policyId)
        }).catch(err => {
          console.log(err)
        })
    }).catch(err => {
      console.log(err)
      var metadataValues = {
        year: value
      }
      userClient.folders.addMetadata(folderId, userClient.metadata.scopes.ENTERPRISE, TEMPLATE, metadataValues)
        .then(metadata => {
          callback(null, userClient, folderId, value, policyId)
        })
    })
}

function force (userClient, folderId, value, policyId, callback) {
  userClient.metadata.forceApplyCascadePolicy(policyId, userClient.metadata.cascadeResolution.OVERWRITE)
    .then(() => {
      // application started — no value returned
      callback(null, userClient, folderId, value, policyId)
    })
}

router.get('/cascade', ensureAuthenticated, (req, res) => {
   //var folderId = req.params.folderId;
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

router.get('/cascadeinfo', ensureAuthenticated, (req, res) => {
  var folderId = req.query.id
  console.log('folderId: ' + folderId)

  appjs.adminAPIClient.enterprise.getUsers({
    filter_term: 'ken.domen.boxdev@nike.com'
  }, (err, data) => {
    if (err) { console.log(err) }
    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id)

    async.waterfall([

      function (callback) {
        appjs.adminAPIClient.folders.get(folderId)
          .then(folder => {
            callback(null, folder.name, folder.owned_by, folder.path_collection)
          })
      },
      function (name, owner, path_collection, callback) {
        userAPIClient.metadata.getCascadePolicies(folderId)

        .then(cascadePolicies => {
          var policyID = null
          if (cascadePolicies.entries.length > 0) {
            console.log('found cascade policy...')
            policyID = cascadePolicies.entries[0].id
            
            callback(null, name, fonwer, policyID)
          } 
          else {
            callback(null, name, owner,  'no policy')
          }
      })
    }
    ], function (err, name, owner, policy) {
      if (err) { console.log(err) }
      res.json({
        name: name,
        owner: owner,
        policy: policy
      })
    })

  })


  
})

function getOrCreateCascadePolicy (userClient, folderId, value, callback) {
  userClient.metadata.getCascadePolicies(folderId)
    .then(cascadePolicies => {
      var policyID = null
      if (cascadePolicies.entries.length > 0) {
        console.log('found cascade policy...')
        policyID = cascadePolicies.entries[0].id
        callback(null, userClient, folderId, value, policyID)
      } else {
        userClient.metadata.createCascadePolicy('enterprise', TEMPLATE, folderId)
          .then(cascadePolicy => {
            console.log('creating cascadePolicy...')
            callback(null, userClient, folderId, value, cascadePolicy.id)
          })
      }
    })
}


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
