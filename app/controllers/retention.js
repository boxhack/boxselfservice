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

router.post('/retentionupdate', ensureAuthenticated, (req, res) => {
  console.log(req.body.id)
  appjs.adminAPIClient.retentionPolicies
    .assign("1075449", "folder", req.body.id)
    .then(assignment => {
      console.log(assignment);
      res.json({success: "yes"})
    })
    .catch(err => {
      console.log(err);
      res.json({success: "no"})
    });
});

router.get('/retentioninfo', ensureAuthenticated, (req, res) => {
  var folderId = req.query.id;
  console.log("***: " + folderId)

  async.waterfall([

    function (callback) {
      appjs.adminAPIClient.folders.get(folderId)
        .then(folder => {
          callback(null, folder.name, folder.owned_by)
        })
    },
    function (name, owner, callback) {
      appjs.adminAPIClient.retentionPolicies
        .getAssignments("1075449", {type: "folder"})
        .then(assignments => {
          var policy = '3 Year'
          var count = 0;
 
          async.whilst(
              function() { return count < assignments.entries.length; },
              function(callbackLoop) {
                appjs.adminAPIClient.retentionPolicies.getAssignment(assignments.entries[count].id)
                .then(assignment => {
                  console.log("assigned_to: " + assignment.assigned_to.id)
                  if (assignment.assigned_to.id == folderId) {
                    policy = '10 Year';
                  }
                  count++;
                  callbackLoop(null, name, owner, policy, count)
                });
              },
              function (err, name, owner, policy, count) {
                  callback(null, name, owner, policy, count)
              }
          );
        });
      },
    ], function (err, name, owner, policy) {
      res.json({
        name: name,
        owner: owner,
        policy: policy
      })
    });
});


router.get('/retention', ensureAuthenticated, (req, res) => {

  //var folderId = req.params.folderId;
  var folderId = '0';
  console.log("folderId: " + folderId)
  

  appjs.adminAPIClient.enterprise.getUsers({
    filter_term: 'ken.domen.test@nike.com'
  }, (err, data) => {

    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id);

    userAPIClient.folders.getItems(folderId, {
      fields: 'name,type,id,owned_by'
    }, (err, items) => {

      var list = [];
      getAllItemsForFolderId(folderId, 0, list, userAPIClient)
        .then(items => {
          var result = flattenListForFolders(list)
          var count = 0;

          res.render('retention', {
            error: err,
            errorDetails: util.inspect(err),
            folders: result
          });

        });
    });
  });
});

router.get('/retention/:id', ensureAuthenticated, (req, res) => {

  var folderId = req.params.id;
  console.log("folderId: " + folderId)

  appjs.adminAPIClient.enterprise.getUsers({
    filter_term: 'ken.domen.test@nike.com'
  }, (err, data) => {

    var userAPIClient = appjs.sdk.getAppAuthClient('user', data.entries[0].id);

    userAPIClient.folders.getItems(folderId, {
      fields: 'name,type,id,owned_by'
    }, (err, items) => {

      var list = [];
      getAllItemsForFolderId(folderId, 0, list, userAPIClient)
        .then(items => {
          var result = flattenListForFolders(list)
          var count = 0;

          res.render('retention', {
            error: err,
            errorDetails: util.inspect(err),
            folders: result
          });

        });
    });
  });
});




router.get('/updateretention', ensureAuthenticated, (req, res) => {

  var folder_name = req.body.folder_name;
  var co_owner1 = req.body.co_owner1;
  res.redirect("/retention");
});


function ensureAuthenticated(req, res, next) {
  if (req.session.email) {
    return next();
  }
  res.redirect('/auth/box')
}

function flattenListForFolders(list) {
  var result = [];
  for (var i = 0; i < list.length; i++) {
    for (var j = 0; j < list[i].length; j++) {
      if (list[i][j].type == 'folder')
        result.push(list[i][j]);
    }
  }
  return result;
}

function getAllItemsForFolderId(folderId, index, list, client) {
  var LIMIT = 10;

  return new Promise(function (resolve, reject) {
    client.folders.getItems(folderId, {
      offset: index,
      limit: LIMIT
    }, function (err, data) {
      var nextIndex = index + LIMIT;
      list.push(data.entries);

      if (nextIndex < data.total_count) {
        getAllItemsForFolderId(folderId, nextIndex, list, client)
          .then(function () {
            resolve();
          });
      } else {
        resolve();
      }

    });
  });
}
