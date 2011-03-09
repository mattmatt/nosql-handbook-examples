riak = require('riak-js').getClient();
riak.add('tweets').map(function(v) {
  return [{key: v.key, links: v.values[0]["metadata"]["Links"].length}];
}).reduce(function(v) {
  return v.reduce(function(tweets, next) {
    if (next.links > 0) {
      tweets.push(next);
    }
    return tweets;
  }, []);
}).run()
