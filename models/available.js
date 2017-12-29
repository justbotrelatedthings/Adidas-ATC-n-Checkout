const mongoose = require('mongoose');
const config = require('../config');
var Token = require('../models/token.js');
var util = require('util');
var mongoDB_URL = config.mongoDB_URL;
var deasync = require('deasync');

mongoose.connect(config.mongoDB_URL, {
  useMongoClient: true
});

var done1 = false;

setInterval(function(){
  Token.count({ __v: 0 }).exec(function(err, c) {
    global.availableTokens = c;
    global.tokensNeededs = config.tokens - availableTokens;
    done1 = true;
  });
}, 1000);
/*Making sure we check how many tokens are available before we start generating anything.*/
require('deasync').loopWhile(function(){return !done1;});
