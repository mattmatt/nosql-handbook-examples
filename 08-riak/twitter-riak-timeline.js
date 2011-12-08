var TwitterNode = require('./vendor/twitter-node').TwitterNode;
var riak = require('./vendor/riak-js').getClient();
var sys = require('sys');
var twitter = new TwitterNode();
twitter.user = process.env['TWITTER_USER'];
twitter.password = process.env['TWITTER_PASSWORD'];

twitter.track('justin bieber');

twitter.addListener('error', function(error) {
  console.log(error.message);
});

function reconcile(objects) {
  var changes = [];
  for (var i in objects) {
    changes.concat(objects[i].data.entries);
  }
  changes.reduce(function(acc, current) {
    if (acc.indexOf(current) == -1) {
      acc.push(current);
    }
    return acc;
  }, []);
  return changes.sort().reverse();
}

twitter.addListener('tweet', function(tweet) {
  var tweetObject = {user: tweet.user.screen_name, tweet: tweet.text, tweeted_at: tweet.created_at}
  var links = [];
  var key = tweet.id_str;
  if (tweet.in_reply_to_status_id_str != null) {
    console.log("Tweet " + key + " is a reply to " + tweet.in_reply_to_status_id_str);
    links.push({tag: 'in_reply_to', bucket: 'tweets', key: tweet.in_reply_to_status_id_str});
  }
  riak.save('tweets', key, tweetObject, {links: links}, function(error) {
    if (error != null) {
      console.log(error);
    } else {
      riak.get("timelines", tweetObject.user, function(e, timeline, meta) {
        if (e && e.notFound) {
          timeline = {entries: []};
        } else if (meta.statusCode == 300) {
          console.log("reconciling #{tweetObject.user}'s timeline");
          var entries = reconcileConflicts(timeline);
          timeline = timeline[0];
          timeline.entries = entries;
        }
        if (!meta.vclock) {
          meta = {}
        }
        timeline.entries.unshift(tweet.id.toString());
        riak.save("timelines", tweetObject.user, timeline, meta);
      });
    }
  })
}).stream();
