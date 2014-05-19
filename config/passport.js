//loads all the things we need 

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

//load the user model 
var User = require('../models/index').User;

//load the authentication API keys, etc. 
var configAuth = require('./auth')

//expose this function to our app using module.exports

module.exports = function(passport){
    

} //closes module.exports 