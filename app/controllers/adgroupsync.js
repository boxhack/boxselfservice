var express = require('express'),
  router = express.Router();

var appjs = require('../../app');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var util = require('util');
var config = require('../../config/config');
var async = require('async');


module.exports = (app) => {
  app.use('/', router);
};

router.get('/adgroups', ensureAuthenticated, (req, res) => {
  queryADGroupCollection()
    .then(results => {
      res.render('adgroups', {
        groups: results
      });
    }, function (err) {
      console.log(err); // ???
    });
});

router.post('/adgroups', ensureAuthenticated, (req, res) => {
  var groupName = req.body.group_name;
  var names = groupName.split(",");

  // --------------------------------------------------------------------------
  // waterfall is used here because we need to (n) addADGroups asynchronously first,
  // then get the new collection to display
  // --------------------------------------------------------------------------
  var count = 0;
  async.whilst(
    () => { return count < names.length },   
    callbackLoop => {
      var name = names[count++].trim();
      addADGroup({ groupName: name, status: 'Requested' }, count, callbackLoop);
    },
    (err, n) => {
      queryADGroupCollection()
        .then(results => {
          res.render('adgroups', {
            groups: results
          });
        }, err => {
          console.log(err);
        });
    }
  )
});

router.get('/deleteadgroups', ensureAuthenticated, (req, res) => {
  deleteADGroup(req.query.id)
    .then(() => queryADGroupCollection())
    .then(results => {
      res.render('adgroups', {
        groups: results
      });
    }, function (err) {
      console.log(err);
    });
});

function ensureAuthenticated(req, res, next) {
  if (req.session.email) { return next(); }
  //if (req.session.email && req.session.accessLevel > 1) { return next(); }
  //if (req.session.email && req.session.accessLevel <=1) { return res.redirect('/landingpage') }  
  res.redirect('/auth/box')
}

// ------------------------------------------------------------------------------
// DocumentDB
// ------------------------------------------------------------------------------
var documentClient = require("documentdb").DocumentClient;

var dbclient = new documentClient(config.dburl,
  { "masterKey": config.dbmasterkey });

// ADD THIS PART TO YOUR CODE
var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/eedevdb`;
var boxADGroupCollectionUrl = `${databaseUrl}/colls/eedevcoll`;

function addADGroup(params, i, callbackLoop) {
  return new Promise((resolve, reject) => {
    dbclient.createDocument(boxADGroupCollectionUrl, params, (err, created) => {
      if (err) reject(err)
      else {
        callbackLoop(null, i);
        resolve(created);
      }
    });
  });
};

// this just sorts the results in descending order by date created
function queryADGroupCollection() {
  "use strict";

  return new Promise((resolve, reject) => {
    dbclient.queryDocuments(
      boxADGroupCollectionUrl,
      'SELECT * from c order by c._ts DESC'
    ).toArray((err, results) => {
      if (err) reject(err)
      else resolve(results);
    });
  });
};

function deleteADGroup(dburl) {
  return new Promise((resolve, reject) => {
    dbclient.deleteDocument(dburl, (err, created) => {
      if (err) reject(err)
      else resolve(created);
    });
  });
};