var express = require('express');
var router = express.Router();
var models = require('../models/');

/* GET home page. */
router.get('/', function(req, res) {
  var is_deleted = req.query.deleted;
  var deleted;
  
  if (is_deleted === "true") {
    deleted = true;
  } else {
    deleted = false;
  }
  
  var docs = models.Page.find(function(err, docs) {
    res.render('index', { docs: docs, deleted: deleted });
  });
});

module.exports = router;
