var TwitterNode = require('twitter-node').TwitterNode;
var riak = require('riak-js').getClient();
var sys = require('sys');
var twitter = new TwitterNode();
twitter.user = process.env['TWITTER_USER'];
twitter.password = process.env['TWITTER_PASSWORD'];

twitter.track('justin bieber');

twitter.addListener('error', function(error) {
  console.log(error.message);
});

twitter.addListener('tweet', function(tweet) {
  console.log('tweet!');
  var createdAt = new Date(tweet.created_at).toISOString();
  var key = tweet.id_str;
  var tweetObject = {user: tweet.user.screen_name,
                     tweet: tweet.text,
                     tweeted_at: createdAt,
                     id_str: key}
  var links = [];
  if (tweet.in_reply_to_status_id_str != null) {
    links.push({tag: 'in_reply_to',
                bucket: 'tweets',
                key: tweet.in_reply_to_status_id_str});
  }
  riak.save('tweets', key, tweetObject, {links: links}, function(error) {
    if (error != null)
      console.log(error);
  });
}).stream();
