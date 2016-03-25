// Dependencies
// source: https://scotch.io/tutorials/making-mean-apps-with-google-maps-part-i
// -----------------------------------------------------
var express        = require('express');
var mongoose       = require('mongoose');
var port           = process.env.PORT || 80; //must run as sudo to use port 80
var bcrypt 		   = require('bcryptjs');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var jwt 		   = require('jwt-simple');
var moment 		   = require('moment');
var path 		   = require('path');
var request 	   = require('request');
var config         = require('./server/config.json');
var app            = express();

// Express Configuration
// -----------------------------------------------------
// Sets the connection to MongoDB
//mongoose.connect("mongodb://localhost/yourappname");

// Logging and Parsing
app.use(express.static(__dirname + '/public'));                 // sets the static files location to public
app.use('/bower_components',  express.static(__dirname + '/bower_components')); // Use BowerComponents
app.use(morgan('dev'));                                         // log with Morgan
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({extended: true}));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());

// Routes
// ------------------------------------------------------
require('./server/routes.js')(app);

// Listen
// -------------------------------------------------------
app.listen(port);
console.log('App listening on port ' + port);
console.log(__dirname);
