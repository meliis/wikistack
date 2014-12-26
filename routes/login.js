var express = require('express');
var router = express.Router();
var passport = require('passport');

//login routes go here

router.get('/', function(req, res) {
	res.render('login', {message: req.flash('loginMessage')});
})

router.post('/',
	passport.authenticate('local-login', {// route middleware!!
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}));

module.exports = router;
