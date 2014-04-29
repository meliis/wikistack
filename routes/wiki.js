var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('add');
});
 
router.post('/submit', function(req, res) {
  var models = require('../models/');
  
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

module.exports = router;
