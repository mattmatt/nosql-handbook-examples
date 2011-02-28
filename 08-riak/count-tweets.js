riak = require('riak-js').getClient();

riak.add('tweets').map(function(value, keyData, arg) {
  return [1];
}).reduce('Riak.reduceSum').run();
