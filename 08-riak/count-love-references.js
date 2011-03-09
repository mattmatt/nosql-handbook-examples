riak = require('riak-js').getClient();

riak.add('tweets').map(function(value, keyData, arg) {
  var tweet = '';
  try {
    tweet = Riak.mapValuesJson(value)[0].tweet;
  } catch(e) {}
  var matches = tweet.match(/love/ig);
  if (matches != null) {
    return [matches.length];
  } else {
    return [0];
  }
}).reduce('Riak.reduceSum').run();
