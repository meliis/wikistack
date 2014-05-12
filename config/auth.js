//expose our config directly to our application using modules


//using environmental variables to store API keys
var facebookId = process.env.facebookId;

var facebookSecret = process.env.facebookSecret

module.exports = {
    'facebookAuth' : {
        'clientID'      : '1401480153470708', // your App ID
        'clientSecret'  : '5e358cb73450edc8e15f32f68326550a', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }
}