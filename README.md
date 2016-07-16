# Node Twitter Test

## About
A Node.js app, using Express, for retrieving and displaying a user's tweets. API results from Twitter are cached to prevent excessive API calls.

## Installation
(Assuming Node.js and npm already installed)

1. Run `npm install`
2. [Create a Twitter application](https://apps.twitter.com/app/new) and [generate a bearer token](https://dev.twitter.com/oauth/application-only)
2. Add Twitter API credentials to `config.js`
3. Run `npm start`

## Usage
Visit `http://localhost:3000/@{username}` to view tweets; e.g. `http://localhost:3000/@cnn`
