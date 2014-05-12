var express = require('express');
var router = express.Router();
var passport = require('passport');

//show the signup form
router.get('/', function(req, res) {
  //renders the page and passes in any flash data if it exists
  res.render('signup.html', {message: req.flash('signupMessage')});
});

router.post('/', passport.authenticate('local-signup', {
    successRedirect : '/home', //where successful redirects get redirected. BUT THIS (/profile) DOESN'T EXIST YET 
    failureRedirect : '/signup', //where failed authentication gets redirected
    failureFlash : true
}))

module.exports = router;