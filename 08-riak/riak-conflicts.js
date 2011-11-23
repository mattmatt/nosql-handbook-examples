riak = require('riak-js').getClient()

riak.remove('tweets-timeline', 'roidrage', function() {});

var entry1 = {
  id: "12121131241321",
  tweeted_at: new Date(),
  tweet: "It's just JavaScript!"
};

var entry2 = {
  id: "12121212121311",
  tweeted_at: new Date(),
  tweet: "JavaScript everywhere!"
}

var timeline1 = {entries: []};
var timeline2 = {entries: []};

timeline1.entries.push(entry1);
timeline2.entries.push(entry2);
timeline2.entries.push(entry1);

function reconcileTimelines() {
  var timeline1 = arguments['0'].entries;
  var timeline2 = arguments['1'].entries;
  var reconciledTimeline = timeline1.concat(timeline2);
  reconciledTimeline = reconciledTimeline.sort(
    function(e1, e2) {
      if (e1.tweeted_at > e2.tweeted_at) {
        return -1;
      } else if (e1.tweeted_at < e2.tweeted_at) {
        return 1;
      } else {
        return 0;
      }
    }
  ).reduce(function(previous, current) {
    var duplicate = previous.filter(function(entry) {
      if (entry.id === current.id) {
        return true;
      } else {
        return false;
      }
    });
    if (duplicate.length == 0) {
      previous.push(current);
    }
    return previous;
  }, []);
  return reconciledTimeline;
}

riak.updateProps('tweets-timeline', {allow_mult: true})

riak.save("tweets-timeline", 'roidrage', timeline1, function() {
  riak.save("tweets-timeline", 'roidrage', timeline2, function () {
    riak.get('tweets-timeline', 'roidrage', function(e, d, m) {
      if (m.statusCode == 300) {
        console.log(d);
        var entries = reconcileTimelines(d[0].data, d[1].data);
        console.log(entries);
        var vclock = d[1].meta.vclock;
        var timeline = {entries: entries};
        riak.save("tweets-timeline", 'roidrage', timeline, {vclock: vclock}, function() {
          riak.get('tweets-timeline', 'roidrage', function(e, d, m) {
            console.log(m.statusCode);
          });
        });
      }
    })
  });
});
