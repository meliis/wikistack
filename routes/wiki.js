var express = require('express');
var router = express.Router();
var models = require('../models/');

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('add');
});
 
router.post('/submit', function(req, res) {
  
  var title = req.body.title;
  var body = req.body.body;
  
  var generateUrlName = function(name) {
    if (typeof name != "undefined" && name !== "") {
      // Removes all non-alphanumeric characters from name
      // And make spaces underscore
      return name.replace(/[\s]/ig,"_").replace(/[^\w]/ig,"");
    } else {
      // Generates random 5 letter string
      return Math.random().toString(36).substring(2,7);
    }
  };

  var url_name = generateUrlName(title);
  
  // STUDENT ASSIGNMENT:
  // add definitions of the `title`, `body` and `url_name` variables here
 
  var p = new models.Page({ "title": title, "body":body, "url_name": url_name});
  p.save();
  res.redirect('/');
  
});

router.get('/:url_name/:id', function(req, res) {
  var url_name = req.params.url_name;
  var id = req.params.id;
  
  models.Page.findById(id,function(err, doc) {
    res.render('show_page', { page: doc });
  });
});

router.get('/:url_name', function(req, res) {
  var url_name = req.params.url_name;
  var isupdated = req.query.updated;
  var updated = (isupdated === "true") ? true:false;
  
  models.Page.find({url_name: url_name},function(err, query_results) {
    if (query_results.length > 1) {
      res.render('disambiguation', { pages: query_results });
    } else {
      res.render('show_page', { page: query_results[0], updated: updated });
    }
  });
});

router.get("/edit/:id", function(req,res) {
  var id = req.params.id;

  models.Page.findById(id,function(err, doc) {
    res.render('edit', { page: doc });
  });
  
});

router.post("/edit_submit/:id", function(req,res) {
  var new_title = req.body.title;
  var new_body = req.body.body;
  var id = req.params.id;
  
  models.Page.findByIdAndUpdate(id, {title: new_title, body: new_body}, function(err, doc) {
    res.redirect('/wiki/'+doc.url_name+"?updated=true");
  });
  
  
});

router.get("/delete/:id", function(req,res) {
  var id = req.params.id;
  models.Page.findByIdAndRemove(id, function(err, data) {
    res.redirect("/?deleted=true");
  });
  
});

module.exports = router;
