var express = require('express');
var router = express.Router();
var passport = require('passport');

//show the login form
router.get('/', function(req, res) {
  //renders the page and passes in any flash data if it exists
  res.render('login', {message: req.flash('loginMessage')});
});

//process the login form 
router.post('/', passport.authenticate('local-login', {
  successRedirect: '/home', //redirect to the secure home section << changed 'profile'
  failureRedirect: '/login', //redirect back to the login page if there's an error
  failureFlash: true
}));

module.exports = router;
