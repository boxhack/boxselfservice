const config = require('./config/config')

var express = require('express')
var exphbs = require('express-handlebars')
var session = require('express-session')
var path = require('path')
var fs = require('fs')
var util = require('util')
var multipart = require('express-formidable').parse
var bodyParser = require('body-parser')
var BoxSDK = require('box-node-sdk')
var logger = require('morgan')
var async = require('async')

console.log('host: ' + config.env)

// Set up Express and the Box SDK
var app = express()
var sdk = new BoxSDK({
  clientID: config.clientID,
  clientSecret: config.clientSecret,
  appAuth: {
    keyID: config.publicKeyID,
    privateKey: config.privateKey,
    passphrase: config.passphrase
  }

})

module.exports.sdk = getSDK()

function getSDK () {
  return sdk
}

// Use a single SDK client for the app admin, which will perform all operations
// around user management
var adminAPIClient = sdk.getAppAuthClient('enterprise', config.enterpriseID)

module.exports.adminAPIClient = getAdminClient()

function getAdminClient () {
  return adminAPIClient
}

// We need to parse POST bodies for form submissions
app.use(bodyParser.urlencoded({
  extended: false
}))

// Set up sessions, so we can log users in and out
app.use(session({
  secret: 'session secret',
  resave: false,
  saveUninitialized: false
}))

app.use(logger('dev'))

app.use((req, res, next) => {
  if (req.session.email) {
    res.locals.email = req.session.email
    req.sdk = sdk.getAppAuthClient('user', req.session.userID)
    req.user = req.session.user // NEW! - this is how you attach properties to the request object - WEIRD!!!
  }
  next()
})

app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))


app.get('/logout', (req, res) => {
  // To log the user out, we can simply destroy their session
  req.session.destroy(() => {
    res.redirect('/')
  })
})

// NEW!  You must add this or else first login won't be logged in!
app.get('/', (req, res) => {
  res.redirect('/landingpage')
})

app.get('/auth/box', (req, res) => {
  var ADEmail = req.headers['x-ms-client-principal-name'] // New!  Eliminate double logging

  console.log('===================================')
  console.log('ADEmail: ' + ADEmail)
  console.log('===================================')

  if (typeof ADEmail !== 'undefined') {
    req.session.email = ADEmail.toLocaleLowerCase()
    res.locals.email = ADEmail.toLocaleLowerCase()
    checkAccessLevel(user, email, req, res)
  } else if (config.env == 'dev') {
    req.session.email = 'ken.domen.boxdev@nike.com'
    res.locals.email = 'ken.domen.boxdev@nike.com'

    var email = 'ken.domen.boxdev@nike.com'

    checkAccessLevel(null, email, req, res)
  }
})

function checkAccessLevel (user, email, req, res) {
  res.redirect('/landingpage')
}

module.exports = require('./config/express')(app, config)

app.listen(config.port, () => {
  console.log('Express server listening on port ' + config.port)
})
