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


//Another addition is the public API for express Routers. A Router is like a mini express app. It contains no views or settings but does provide the typical routing APIs (.use, .get, .param, .route). Apps and Routers can also .use() other routers allowing you to create files that export a router to organize your apps better.

