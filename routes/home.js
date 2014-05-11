var express = require('express');
var router = express.Router();
var models = require('../models/');

/* GET home page. */
//we want this protected so you have to be logged in to visit
//we'll use route middleware to verify this ()
router.get('/', isLoggedIn, function(req, res) {
  var is_deleted = req.query.deleted;
  var deleted;
  
  if (is_deleted === "true") {
    deleted = true;
  } else {
    deleted = false;
  }
  
  var docs = models.Page.find(function(err, docs) {
    res.render('home', { docs: docs, deleted: deleted });
  });
});

router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/'); 
})


//the isLoggedIn function i

//note that we've written this function as a 
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  console.log('isLoggedIn function running')
  next();
  // res.redirect('/') //if not authenticated, redirect to main page
}

module.exports = router;

//Another addition is the public API for express Routers. A Router is like a mini express app. It contains no views or settings but does provide the typical routing APIs (.use, .get, .param, .route). Apps and Routers can also .use() other routers allowing you to create files that export a router to organize your apps better.

