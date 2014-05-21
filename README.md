#WORKSHOP TUTORIAL - learn.fullstackacademy.com 
####built for the students of [@Fullstack](https://twitter.com/fullstack) Academy.

##AUTHENTICATED WIKISTACK 
In this workshop, we’ll build a layer of authentication on our old friend, Wikistack. Along the way, we’ll learn more about local and provider authentication, middleware, session cookies, and security. 

###What is authentication? 
Authentication refers to the process of checking that a user is authorized to access a part of an application; i.e., a login process. The most common method of authentication in Node applications is by using the Passport.js npm package, which provides us with a bunch of helpful utilities as we go about the authentication process. 

We’ll be exploring how to implement **local** Passport.js authentication, which refers to authenticating a logged-in user with a username (or email address) and password **unique** to that application. When it comes to authentication, a “strategy” refers to the source of your user’s information, as well as how we identify these users. 

**Local** as a term is contrasted with **foreign** strategies (or provider strategies) that come from third-party applications like Facebook and Twitter. So we can either get our user information from our local strategy--through their self-provided email login and password--or through the provider strategies of Facebook or Twitter. Along those lines, we’ll also learn how to implement Facebook authentication with Wikistack. 

###To begin
We’ll start off by cloning a modified version of WikiStack. We’ve changed the structure a bit--formerly, the index.html page was the main page displaying a list of all the articles, and the index.js file in our routes directory specified the corresponding routes to the main page. Now, the index.html page is the login page--with index.js the corresponding login routes--and home.html is the main article list page. 

{% terminal %}
$ git clone https://github.com/FullstackAcademy/privatewikistack
$ npm install 
{% endterminal %}

##packages we’re installing 

{% terminal %}
$ npm install 
{% endterminal %}

###express-session
Expression-session is a middleware module which creates *sessions*. We’ll go in depth into what sessions and cookies are, and why they’re important to authentication, later in this workshop. [Documentation here](https://github.com/expressjs/session)

###connect-flash
The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that has to be rendered. Connect-flash allows us to display error messages. [Documentation here](https://github.com/jaredhanson/connect-flash)

###bcrypt-nodejs 
Allows us to hash a password, or it allows us to take a block of data and returns a string so that you can’t retrieve your original data from that string. Hashing a password will take a clear text string and perform an algorithm on it to get a completely different value. This value will be the same every time, so you can store the hashed password in a database and check the user’s entered password against the hash. This prevents you from storing the original cleartext password in the database. In our app, we’ll be hashing our password within our user model before it’s saved to the database. 

A hash is a one-way function, so you run a function that will ‘undo’ a hash. The library we’re using will use a hash to encrypt a password, and throw in some random data--a ‘salt’--to the hash for increased security. [Documentation here](https://www.npmjs.org/package/bcrypt-nodejs)

###passport-facebook
A facebook authentication strategy for Passport. [Documentation here](https://github.com/jaredhanson/passport-facebook)

###passport-twitter
We won’t be implementing this strategy in this workshop, but feel free to implement it as extra-credit at the end! Passport strategies for Github and Google also exist, and are implemented in much of the same ways. [Documentation here](https://github.com/jaredhanson/passport-twitter)

##Local Authentication 
We’ll start out by building the local authentication--asking the user to create an account and sign in with an email address and a password string. 

###Setting up the app.js 

Let’s require passport, flash, and express-session, and then add some new middleware to our app.js file. Your app.js file should look like the following: 

{% hint app.js with new middleware %}
```javascript 
var express = require('express');
var swig = require('swig');
var passport = require('passport');
var flash = require('connect-flash');

require('./filters')(swig);
require('./config/passport')(passport); //passport object is passed from the server.js file to the config/passport.js file 

var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var home = require('./routes/home');
var users = require('./routes/users');
var add_routes = require('./routes/add');
var wiki_routes = require('./routes/wiki');
var login_routes = require('./routes/login');
var signup_routes = require('./routes/signup');

var app = express();
app.engine('html', swig.renderFile);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//standard Express middlewares
app.use(favicon()); //logs requests to the console
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//required for passportJS

app.use(session({ secret: 'tongiscool' })); // session secret, the salt used to encrypt the session ids which are stored in the client's browser. 
app.use(passport.initialize()); //creates our passport object
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', routes);
app.use('/home', home);
app.use('/login', login_routes);
app.use('/signup', signup_routes);
app.use('/users', users);
app.use('/add', add_routes);
app.use('/wiki', wiki_routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    swig.setDefaults({ cache: false });
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

```
{% endhint %} 

All of the “app.use” functions are middleware. What are middleware, and why do we modify the middleware to create our authentication methods? Read on, my friends! 

###What is Middleware? 

Both passport and express-session are middleware, which is a term used to refer to all all the functions that 1) handle the request object that is passed into our express routers and 2) interact with the response object that the routers pass back to our front end. 

A server created by express usually has a stack of middleware functions. In express, the app.use(function()) function is used to call middleware functions--check out the app.js file to see our middleware stack. 

Conceive of the middleware stack as quite literally a *stack*--the order in which our ‘app.use(function())’ functions are placed in our app.js file is the order by which our request object passed. If one middleware is dependent on the functionality of another middleware, it’s very important that the first middleware is placed *after* the second. (For instance, in this workshop, our passport middleware is dependent on the express session middleware which is dependent on the cookie-parser middleware, so we list the passport function after the express session function after the cookie-parser middleware. But more on that later.) 

When a request comes in to a middleware stack, the request is passed to the first middleware function, along with a wrapped response object and a next callback. Each middleware can decide to respond by calling methods on the response object, and/or pass the request onto the next layer in the stack by calling next(). 

(Note that some of the middleware, for instance app.use(passport.initialize()), doesn’t seem to take in the normal (req, res, next()) arguments. However, these middleware are functions which return a function, and these returned functions have the normal set of (req, res, next()) arguments.) 

An abstract way of thinking about express is an array of functions, where the router receives the requests, chooses which set of handlers responds to that request, and then passes the request and response objects through the array of middleware functions. 

A middleware (it sounds awkward, right?) can also let us know that there’s an error by passing the error object as the first argument in next(). When a middleware returns an error, all the next middleware will be skipped until express finds an error handler. 

What are some common things middleware are used for? Logging (printing out what’s happening with the requests and responses), serving static files, error handling, routing requests to controllers. You should use middleware anywhere you might want to have some sort of generic request handling logic applied to requests. Google the names of the middlewares in the app.js file, and see if you can read the docs to determine what it’s actually doing to requests pumped into express. 

[Citation](http://stephensugden.com/middleware_guide/) 

###So what’s actually going on with the middleware and Passport? 

Before understanding how authentication works, it’s important to first understand what a *session* is, and how session information is frequently stored in *cookies*. Cookies are small text files with an ID which come from the visited site’s server which are stored in the browser, a session is a cookie-based connection between the browser and server that uniquely identifies each browser to the server; as long as that browser still has taht cookie. 

####Session Cookies
Session information is frequently stored in cookies so that the website you’re visiting can keep track of your movements from page to page, so you don’t get asked for the same information you’ve already given to the site. Session cookies allow you to proceed through different pages without having to authenticate each time you go to a new page. A common use case of session cookies: the shopping cart of an e-commerce site. As you navigate throughout the site, the site keeps track of who you are and how many items are in your cart within the session cookie stored in your browser. Citation [here](http://www.allaboutcookies.org/cookies/session-cookies-used-for.html).

With `app.use(session({secret: ‘tongiscool’}))`, we’re either doing one of two things. We’re either creating a new session in express if this is the user’s first time using the app, or we’re checking to see the cookie returned from the client’s browser has a valid session id. If we create a new session, express-session generates a unique session ID for the user’s specific login visit, or “session”, to our site. We then encrypt this ID with the secret, and put the ID within the cookie which is stored in the client’s browser. The ID is encrypted with the secret--’tongiscool’--so that others can’t pretend to be this user on the site; the user has no idea what their session ID actually is. 

And then the cookie is sent with every request. Express will decode the cookie using the middleware stack (beginning with the cookie-parser). Because the session ID is also stored on the server side, express will use the secret to decode the hashed session ID in the cookie, and confirms (or authenticates) that the user is in fact the person who first created the original session ID. When this authentication happens, then express recalls all the session parameters from the database that we’ve stored, which are then sent back to the client. 

TIP: All this is happening in the `app.js` middleware! 

###Routes 

We’ve added route javascript files for the home, login, and signup routes. We’ve also modified the index route file from what previously existed for Wikistack. Let’s first take a look at the `app/routes/index.js` routes file. Let’s take a look at the new routes, one of which uses a standard logout function provided by passport: 

```javascript
var express = require('express');
var router = express.Router();
var passport = require('passport')

/* GET landing page. */

router.get('/', function(req, res) {
  res.render('index.html');
});

//route for logging out 
router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/'); 
})

module.exports = router;

```

See if you figure out, based on the passport docs, how to use passport.authenticate(‘local-login’) to write the routes for the login and signup pages. 

{% hint local-login authentication routes for login.js %}

```javascript

//show the login form
router.get('/', function(req, res) {
  //renders the page and passes in any flash message data (for potential errors) if it exists
  res.render('login', {message: req.flash('loginMessage')});
});

//process the login form 
router.post('/', passport.authenticate('local-login', {
  successRedirect: '/home', //redirect to the secure home section << changed 'profile'
  failureRedirect: '/login', //redirect back to the login page if there's an error
  failureFlash: true
}));

```
{% endhint %}

{% hint local-signup authentication routes for signup.js %}

```javascript

//show the signup form
router.get('/', function(req, res) {
  //renders the page and passes in any flash data if it exists
  res.render('signup.html', {message: req.flash('signupMessage')});
});

router.post('/', passport.authenticate('local-signup', {
    successRedirect : '/home', //where successful redirects get redirected. 
    failureRedirect : '/signup', //where failed authentication gets redirected
    failureFlash : true
}))

```
{% endhint %}

Finally, we need to write our express routes in `home.js`, the routes which display the wikistack content. These routes are protected--without authenticating, a user can’t access these routes. The home.js route currently has a ‘get’ route, but notice that there’s an additional middleware before the callback. You need to define the isLoggedIn function--note that his is going to use a passport.js function to check and see if the user is authenticated. 



{% hint isLoggedIn function for home.js %}

```javascript

function isLoggedIn(req, res, next){ //note that this is a function declaration, NOT an expression. It loads before any code is called--compare this with a function expression. Why did we write this as a declaration? http://stackoverflow.com/questions/1013385/what-is-the-difference-between-a-function-expression-vs-declaration-in-javascrip
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/') //if not authenticated, redirect to main page
}

```
{% endhint %}


And we need to make one more change to our `home.js` routes--we need to make sure that when we render the article names on our page, we also want to returned information about the user so we can display the user information in the home profile view. How might you do that? 

{% hint passing reference to user through to view %}
```javascript
  var docs = models.Page.find(function(err, docs) {
    res.render('home', { docs: docs, deleted: deleted, user: req.user});
  });
```
{% endhint %}

Finally, we need to incorporate that same isLoggedIn function within our `wiki.js` routes, since we don’t want unauthenticated users to be able to navigate directly to a page if they know the article’s id. Do that now. 

###Views

###Views

We need a landing page (index.html) with login, signup, and Facebook signup buttons. Try building one that looks like this: 

<a href="http://s34.photobucket.com/user/Tong_Xiang/media/wiki-indexlandingpage_zps32a83fc4.png.html" target="_blank"><img src="http://i34.photobucket.com/albums/d147/Tong_Xiang/wiki-indexlandingpage_zps32a83fc4.png" border="0" alt="indexLanding photo wiki-indexlandingpage_zps32a83fc4.png"/></a>

We also need to modify our articles page to display information about the user’s local profile, as well as the Facebook profile (home.html). While we haven’t linked up the routes to display the user’s information, try building one that looks like the below: 

<a href="http://s34.photobucket.com/user/Tong_Xiang/media/wiki-homeprofile_zpsd1f85b8a.png.html" target="_blank"><img src="http://i34.photobucket.com/albums/d147/Tong_Xiang/wiki-homeprofile_zpsd1f85b8a.png" border="0" alt="homeProfile photo wiki-homeprofile_zpsd1f85b8a.png"/></a>

Let’s also populate our local signup and local login pages. A local signup page could look like this: 

<a href="http://s34.photobucket.com/user/Tong_Xiang/media/wiki-signup_zpsf4dcfe78.png.html" target="_blank"><img src="http://i34.photobucket.com/albums/d147/Tong_Xiang/wiki-signup_zpsf4dcfe78.png" border="0" alt="signup photo wiki-signup_zpsf4dcfe78.png"/></a>

And a local login page could look like this: 

<a href="http://s34.photobucket.com/user/Tong_Xiang/media/wiki-loginpage_zps8a417dac.png.html" target="_blank"><img src="http://i34.photobucket.com/albums/d147/Tong_Xiang/wiki-loginpage_zps8a417dac.png" border="0" alt="Login photo wiki-loginpage_zps8a417dac.png"/></a>

###Mongoose Model : User 

So far we’ve wired up our routes, and created our views. We also want to add a new user model so that we can store user authentication information in our database. In creating a new Mongoose schema, we want our users to be able to be linked to their facebook account, as well as a local account. For our local accounts, we need to store an **email** and **password**. For the facebook accounts, we want to store the user’s **id**, **token**, **email**, and **name**. Let’s add this new schema to models/index.js. 

Within models/index.js, we also want to attach two class methods to our userSchema: a generateHash method which turns takes the user’s password as an argument, and returns a hash (we store inputted password as a hash within our database); and a validPassword method, which checks to see whether or a password is valid. Both of these methods will be implemented with the bcrypt library--see if you can figure this out by googling the documentation. 

{% hint user model, generateHash, and validPassword methods %}

```javascript
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

```
{% endhint %}

###Passport Configuration Code 

Now we need to configure passport to effectively authenticate our users locally! We’re going to be keeping all our Passport configuration code in `config/passport.js.`

Remember how, in our signup.js routes we used a callback function called `passport.authenticate(){}`, which took in a `local-signup` argument; and how in our login.js routes we also used a callback function called `passport.authenticate(){}`, which took in a `local-login` argument? 

We want to configure the `local-signup` and `local-login` functions now in `config/passport.js`. Additionally, we need to implement serializing and deserializing functions. The serialize function returns identifying information to recover the user account on subsequent requests. The deserialize function returns the user profile based on the id of the user that was serialized to the session, and it also attaches the user object to each request object as it passes through the middleware stack. (This is what our isLoggedIn function is checking for in our routes.) 

We won’t make you trudge through the documentation, though, to figure this out--check out the code below, which has some explanatory comments for what’s going on. 

{% hint passport config file %}
```javascript
//loads all the things we need 

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy; //we’ll use this later in the facebook auth part of the workshop

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

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // LOCAL SIGNUP ============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {

        process.nextTick(function() {
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    console.log('saving new user right now')
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

    // LOCAL LOGIN =============================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) { // callback with email and password from our form. Oh this is an anonymous function that's the second callback of the local-login. 
        console.log('in local-login passport function now')
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            console.log('has successfully found the previous user in mongo')
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });
    }));

```
{% endhint %}

Good work! You’ve now finished the local auth portion of this workshop. 

##Enabling Facebook Authentication with Passport

Now let’s incorporate authentication with a third-party provider, or Facebook. We’ll do this through the set of security protocols known as “Oauth”. Oauth (“open standard for authorization”) is a series of specifications, or a set of protocols, that applications use when someone else wants to use a service on your behalf. Read more [here](http://stackoverflow.com/questions/4727226/on-a-high-level-how-does-oauth-2-work) to understand how Oauth works, at a high level. 

In order to create an application which uses the Facebook API (for example: anytime you see, in an app, a pop-up that says something along the lines of “Allow this application to access your list of friends and post to your wall on your behalf?”) we need to first register our app on Facebook’s API site. Go to [Facebook’s developer’s page](https://developers.facebook.com/), login with your Facebook account, and register a new app. 

To access your App ID and App Secret, click on **Apps** at the top menu bar, and select your app. Store the ID and Secret in your notes, but *not* in your application’s code itself. 

Next, we want to specify the callback URL for our app--i.e., we want to specify the URL which Facebook redirects us to after we grant the app permissions to access our Facebook data on Facebook’s site proper. To do this: 

1 - navigate to your app page
2 - click ‘Settings’ on the left-hand sidebar
3 - click ‘Add Platform’ under the main section
4 - click ‘website’ 
5 - specify your callback in the site URL field. For our app, input “http://localhost:3000/auth/facebook/callback”.

In the initial call that goes to facebook, the app identify itself by the APP ID, and it tells Facebook that it wants to authenticate a Facebook user. Facebook then lets the user know what our app is trying to do with your account, what permissions you want to give it, and asks if you want to give the app access to those functions and data on your account. Facebook the generates an Oauth token specific to that user, which is then stored in our user or session object in our app’s database. 

In the future, when our our client logs in to our app, the app uses the access token to access the protected resources hosted by the Facebook server. This token is encrypted, and is essentially a [public key](http://en.wikipedia.org/wiki/Public-key_cryptography) that can only be unlocked with a private key, or your Application Secret. It’s encrypted in the case that the token is intercepted--if someone else gets your token, we don’t want them to be able to fake your credentials and login as you. 

###Where should my API keys and secrets go? 

Since you’re probably committing your workshop changes to a fork of Fullstack’s private repo, it’s pretty safe for you to put your API keys and secret directly into the `auth.js` file in the config directory. This, however, isn’t best practice. 

We don’t want to put our API keys and secrets into our code, which will most likely get pushed up to a public repository. (We don’t want to let people steal our API keys, which can cause all sorts of problems.) 

To that end, we want to save our API keys in *environmental variables* in our MacOSX Unix runtime environment on our machine. We do this by accessing our bash configuration files. (Bash is the program on your computer that is displayed with the terminal.) 

The following is an explanation of what environmental variables are, and how to create them. Feel free to skip this section, as it’s not *critical* to learning how to use Passport.js, but later when you’re making production apps, knowing how to store keys in environmental variables will become essential. 

###A introduction to UNIX environmental variables and the bash configuration files. 

The .bashrc file is a configuration file that runs every time you open a new bash. You store environmental configuration variables in the .bashrc file. 

Inputting the command: $ (tab) (tab) into the command line prints out all the autocompleted options for the $ variable. These are all the native environmental variables in bash. For example, try inputting the commands ‘echo $RUBY_VERSION’ or ‘echo $HOSTNAME’. Additionally, When you use ‘express’ + fileName to quickly generate a new express app, ‘express’ is a bash script, a function that does something in bash. All of these custom bash commands are stored in your /usr/local/bin directory, where executable programs are located. 

$PATH is an environment variable that specifies the set of directories where executable programs are located. (An executable file is something which causes a computer to “perform indicated tasks according to encoded instructions.”) On OSX, the $PATH variable is specified as a list of one or more directory names separated by colon characters. 

When a command name is specified by the user, the system searches through $PATH, examining each directory from left to right in the list, looking for a filename that matches the command name. Once found, the program is executed as a child process of the command shell or program that issued the command. 

So when you use ‘express tongApp.js’, your system searches through the $PATH environmental variable, trying to find the express filename in the list of directories. This environmental variable is also stored in your .bashrc file. (Try and take a look at this by opening up your terminal, and then running the subl ~/.bash_profile command. The ~/ in front of the file name indicates that the path is coming from your root directory. (Or the root user’s home directory.) 

You can also assign specific environmental variables, for example: 

export OWNERNAME = “Tong” 
echo $OWNERNAME 

‘Tong’ 

However, using the ‘export’ command only assigns the environmental variable for as long as the bash (or terminal) session is open. To assign these variables permanently, you can assign them in your .bashrc file. This comes in handy with things like API keys, NODE_ENV variables, etc. Just include a line like either of the ones below in your .bashrc file, and you’re set. 

export NODE_ENV="development"
export FacebookAPISecretKey = “secrets123456”

###Environmental Variables in Heroku 
Later, when you deploy your first apps to Heroku, we want to also store our API keys as environmental variables in the Heroku runtime environment. Consult [this reference](http://tammersaleh.com/posts/managing-heroku-environment-variables-for-local-development/) to learn how. 

###Facebook Authentication Routing 

We next want to add a new route in our `index.js` file that will direct us to the Facebook authentication site: 

{% hint new facebook routes in index.js %}

```javascript
//FACEBOOK ROUTES
//facebook authentication and login 
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/home',
    failureRedirect : '/'
  }));
```
{% endhint %}

### Passport’s Facebook Strategy

Let’s go back to our `config/passport.js` file, and add some Passport configuring for Facebook. Once again, the code is below--consult the comments and the docs to understand what we’re doing with Passport. 

{% hint passport configuration for Facebook %}

```javascript
    // FACEBOOK ================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) { //this is the anonymous callback of the passport.use(new FacebookStrategy)

    //the callback will pass back user profilie information and each service (Facebook, Twitter, and Google) will pass it back a different way. Passport standardizes the information that comes back in its profile object. 

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

```
{% endhint %}

###Incorporating User Information Returned from Facebook
Lastly, we want to make sure that we display the user information in the Facebook user profile panel we created in our home.html page. Think about how we used swig before to display the local user information--given what you know about how we configured our userSchema, how can you display the user’s Facebook information their profile page? 

And we’re done! You should be able login locally and with Facebook, restrict access to article views only to logged-in users, and display the logged in user’s information on the home.html page. 

##Extra Credit
- Incorporate another provider’s Oauth authentication, such as Github or Google! 
- Change the authentication structure of your Wikistack--allow all users to view articles, but only authenticated users to edit pages. 

##Acknowledgments 
This workshop has used [Scotch.io’s authentication tutorial](http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local#application-setup-server.js) as a reference; many thanks to their team. Other citations sprinkled throughout. 
