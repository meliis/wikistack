var express = require('express');
var router = express.Router();
// var models = require('../models/');

//show the login form
router.get('/', function(req, res) {
  //renders the page and passes in any flash data if it exists
  res.render('login', {message: req.flash('loginMessage')});
});

module.exports = router;
