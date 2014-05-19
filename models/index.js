var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/wikistack');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
var Page;
var Schema = mongoose.Schema;
 
var pageSchema = new Schema({
  name:  String,
  title: String,
  url_name: String,
  owner_id:   String,
  body:   String,
  date: { type: Date, default: Date.now },
  status: Number
});
 
Page = mongoose.model('Page', pageSchema);
 
module.exports = {"Page": Page};