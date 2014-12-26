var express = require('express');
var router = express.Router();
var models = require('../models/');

/* GET home page. */
//we want this protected so you have to be logged in to visit
//we'll use route middleware to verify this ()
var isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

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

module.exports = router;
