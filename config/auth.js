//expose our config directly to our application using modules


//using environmental variables to store API keys. Note that you can also just write the key strings in below, but it's not recommended. 

var facebookID = process.env.FACEBOOK_ID,
	facebookSecret = process.env.FACEBOOK_SECRET,
	googleID = process.env.GOOGLE_ID,
	googleSecret = process.env.GOOGLE_SECRET,
	twitterKey = process.env.TWITTER_KEY,
	twitterSecret = process.env.TWITTER_SECRET;

module.exports = {
    'facebookAuth' : {
        'clientID'      : facebookID, // your App ID
        'clientSecret'  : facebookSecret, // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },
    'googleAuth' : {
    	'clientID'		: googleID,
    	'clientSecret'	: googleSecret,
    	'callbackURL'	: 'http://localhost:3000/auth/google/callback'
    },
    'twitterAuth' : {
    	'consumerKey' 	: twitterKey,
    	'consumerSecret': twitterSecret,
    	'callbackURL'	: 'http://localhost:3000/auth/twitter/callback'
    }
}