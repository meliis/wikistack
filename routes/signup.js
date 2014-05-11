var express = require('express');
var router = express.Router();
// var models = require('../models/');

//show the signup form
router.get('/', function(req, res) {
  //renders the page and passes in any flash data if it exists
  res.render('signup.html', {message: req.flash('signupMessage')});
});

//router.post('/', //do all our passport stuff here)

module.exports = router;
