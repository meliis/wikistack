//loads all the things we need 
var LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	TwitterStrategy = require('passport-twitter').Strategy;

//load the user model 
var User = require('../models/index').User;

//load the authentication API keys, etc. 
var configAuth = require('./auth')

//expose this function to our app using module.exports

module.exports = function(passport){
	// passport session setup ======================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
 
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
    	done(null, user.id);
    });

    //deserialize user
    passport.deserializeUser(function(id, done) {
    	User.findById(id, function(err, user) {
    		done(err, user);
    	})
    });

    // LOCAL SIGNUP ============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    passport.use('local-signup', new LocalStrategy({
    		 // by default, local strategy uses username and password, we will override with email
	    	usernameField: 'email',
		    passwordField: 'password',
		    passReqToCallback: true // allows us to pass back the entire request to the callback
 		}, 
   		function(req, email, password, done) {
	    	process.nextTick(function(){
	    		// do you already exist or
	    		User.findOne({'local.email': email}, function(err, user) {
	    			if (err) return done(err);
	    			if (user) return done(null, false, req.flash('signupMessage', 'That email is ALREADY TAKEN'));
	    			else {
	    		      	// if there is no user with that email
	                  	// create the user
	    				var newUser = new User();
	    				// set local credentials
	    				newUser.local.email = email;
	    				newUser.local.password = newUser.generateHash(password);
	    				// save to db
	    				newUser.save(function(err){
	    					console.log("saving new user RIGHT NOW")
	    					if (err) throw err;
	    					return done(null, newUser);
	    				});
	    			}
	    		});
	    	});
    }));

    passport.use('local-login', new LocalStrategy({
	    	usernameField: 'email',
	    	passwordField: 'password',
	    	passReqToCallback: true
    	},
    	function(req, email, password, done) {
    		console.log("in local-login passport function NOW");
    		// do you exist or
    		User.findOne({'local.email': email}, function(err, user) {
    			if(err) return done(err);
    			if (!user) return done(null, false, req.flash('loginMessage', 'No user was even found'));
    			// is your password even right
    			if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', 'That password is INCORRECT'));
    			// all is well, return successful user
    			return done(null, user);
    		});
    	}));

    passport.use(new FacebookStrategy({
    	// pull in our app id and secret from our auth.js file
	    	clientID: configAuth.facebookAuth.clientID,
	    	clientSecret: configAuth.facebookAuth.clientSecret,
	    	callbackURL: configAuth.facebookAuth.callbackURL
    	},
    	// facebook will send back token and profile
    	function(token, refreshToken, profile, done) { // anonymous callback of passport.use(new FacebookStrategy)
    		// callback will pass back user profile information and each service (FB, twitter, google) will pass it back
    		// in a different way.  passport standardizes the information that comes back in its profile object
    		process.nextTick(function() {
    			User.findOne({'facebook.id': profile.id}, function(err, user) {
    				if(err) return done(err);
    				if (user) return done(null, user);
    				else {
    					var newUser = new User();
    					newUser.facebook.id = profile.id; // set user's fb id
    					newUser.facebook.token = token; // save token that fb provides to user
    					newUser.facebook.name = profile.name.givenName+' '+profile.name.familyName;
    					newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take first
    					newUser.save(function(err) {
    						if (err) throw err;
    						return done(null, newUser);
    					});
    				}
    			});
    		});
    	}
    ));

	passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL
	},
		function(token, refreshToken, profile, done) {
			process.nextTick(function() {
				User.findOne({'google.id': profile.id}, function(err, user) {
					console.log(profile);
					if(err) return done(err);
					if (user) return done(null, user);
					else {
						var newUser = new User();
						newUser.google.id = profile.id;
						newUser.google.token = token;
						newUser.google.name = profile.name.givenName+' '+profile.name.familyName;
						newUser.google.email = profile.emails[0].value;
						newUser.save(function(err) {
							if (err) throw err;
							return done(null, newUser);
						});
					}
				});
			});
		}
	));
	
	passport.use(new TwitterStrategy({
		consumerKey: configAuth.twitterAuth.consumerKey,
		consumerSecret: configAuth.twitterAuth.consumerSecret,
		callbackURL: configAuth.twitterAuth.callbackURL
	},
		function(token, tokenSecret, profile, done) {
			User.findOne({'twitter.id' : profile.id}, function(err, user) {
				console.log(profile);
				if(err) return done(err);
				if (user) return done(null, user);
				else {
					var newUser = new User();
					newUser.twitter.id = profile.id;
					newUser.twitter.token = token;
					newUser.twitter.name = profile.displayName;
					newUser.twitter.email = 'email unavailable';
					newUser.save(function(err) {
						if (err) throw err;
						return done(null, newUser);
					});
				}
			})
		}));

} //closes module.exports 