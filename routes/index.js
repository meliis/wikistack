var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET landing page. */

router.get('/', function(req, res) {
  res.render('index.html');
});

router.get('/flash', function(req, res) {
	req.flash('message', 'hello!');
	res.redirect('/login');
});
//route for logging out 
router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/'); 
})

// facebook routes
router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect: '/home',
		failureRedirect: '/'
	}));

// google routes
router.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email']})); // scope?

router.get('/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/home',
		failureRedirect: '/'
	}));

// twitter routes
router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback',
	passport.authenticate('twitter', {
		successRedirect: '/home',
		failureRedirect: '/'
	}));

module.exports = router;