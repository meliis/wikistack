var express = require('express');
var router = express.Router();
var passport = require('passport');

//signup routes go here

router.get('/', function(req, res) {
	res.render('signup', {message: req.flash('signupMessage')});
});

router.post('/',
	passport.authenticate('local-signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));

module.exports = router;