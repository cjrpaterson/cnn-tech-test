var NodeCache = require('node-cache');
var Promise = require('promise');
var Twitter = require('twitter');
var config = require('./config');
var express = require('express');
var moment = require('moment');
var winston = require('winston');

var app = express();
var cache = new NodeCache({stdTTL: config.cacheTTLSeconds});
var twitter = new Twitter({
 	consumer_key: config.twitter.consumerKey,
 	consumer_secret: config.twitter.consumerSecret,
 	bearer_token: config.twitter.bearerToken
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
moment.locale('en-GB');
app.locals.moment = moment;

app.get('/', function(req, res, next) {
	res.redirect('/@' + config.defaultScreenname);
});

app.get('/@:username', function(req, res, next) {
	var username = req.params.username;
    var cacheKey = 'tweets-' + username;
    var cachedTweets = cache.get(cacheKey);

    /**
     * Render the page with the passed tweets
     * @param {Object[]} - Array of tweet objects
     */
    function renderPage(tweets) {
		res.render('index', {
        	'username': username,
        	'tweets': tweets
		});
    }

	/**
     * Render a basic error page using the passed error object
     * @param {Object[]} - Array of error objects
     */
    function renderError(error) {
		// Twitter API's error code 34 relates to user not found, so 404 is most appropriate
    	var responseCode = error[0].code === 34 ? 404 : 400;
    	var message = 'Twitter API error: ' + error[0].message;

        res.status(responseCode).send(message);
    }

    if (cachedTweets) {
		renderPage(cachedTweets);
    } else {
		getTweets(username, config.tweetsToRetrieve)
        	.then(function(tweets) {
        		cache.set(cacheKey, tweets);
        		renderPage(tweets);
        	})
        	.catch(function(error){
        		winston.error(error);
				renderError(error);
        	});
    }
});

/**
 * Retrieve tweets from the Twitter API
 * @param {string} username - Twitter username to retrieve tweets for
 * @param {number} numberToRetrieve - Number of tweets to retrieve
 * @returns {Promise}
 */
function getTweets(username, numberToRetrieve) {
    return new Promise(function(resolve, reject) {
        var params = {
            screen_name: username,
            count: numberToRetrieve
        };

		twitter.get('statuses/user_timeline', params, function(error, tweets, response) {
			if (error) {
				reject(error);
			}

			resolve(tweets);
        });
    });
}

app.listen(config.listenPort, function() {
	console.log('Listening on ' + config.listenPort);
});
