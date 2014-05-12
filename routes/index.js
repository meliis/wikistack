var express = require('express');
var router = express.Router();

/* GET landing page. */

router.get('/', function(req, res) {
  res.render('index.html');
});

module.exports = router;

router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/'); 
})