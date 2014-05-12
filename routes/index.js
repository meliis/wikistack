var express = require('express');
var router = express.Router();

/* GET landing page. */

router.get('/', function(req, res) {
  res.render('index.html');
});

//route for logging out 
router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/'); 
})

//FACEBOOK ROUTES
//facebook authentication and login 
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/profile',
    failureRedirect : '/'
  }));

module.exports = {'router': router, 'passport': passport}