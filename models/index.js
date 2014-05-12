var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/wikistack');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
var Page, User;
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
 
var userSchema = new Schema({
  name:  {
      first: String,
      last: String
    },
  local            : {
      email        : String,
      password     : String
  },
  facebook         : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
  },
  twitter          : {
      id           : String,
      token        : String,
      displayName  : String,
      username     : String
  },
  google           : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
  }
});

//methods =====
//generating a password hash

userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};
 
Page = mongoose.model('Page', pageSchema);
User = mongoose.model('User', userSchema);
 
module.exports = {"Page": Page, "User": User};