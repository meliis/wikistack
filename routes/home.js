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
    res.render('home', { docs: docs, deleted: deleted, user: req.user});
  });
});

function isLoggedIn(req, res, next){ //note that this is a function declaration, NOT an expression. It loads before any code is called--compare this with a function expression. http://stackoverflow.com/questions/1013385/what-is-the-difference-between-a-function-expression-vs-declaration-in-javascrip
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/') //if not authenticated, redirect to main page
}

module.exports = router;
