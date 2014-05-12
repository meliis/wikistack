var express = require('express');
var router = express.Router();
// var models = require('../models/');

router.get('/', function(req, res) {
  req.logout(); //a function provided by passport 
  res.redirect('/')
});

module.exports = router;