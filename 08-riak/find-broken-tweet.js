riak = require('riak-js').getClient();

riak.add('tweets').map(function(value, keyData, arg) {
  if (value["not_found"]) {
    return [value];
  }
  var newValues = Riak.mapValues(value, keyData, arg);
  return newValues.map(function(nv) {
    try {
      JSON.parse(nv);
      return null;
    } catch (err) {
      return value.key;
    }
  });
}).reduce(function(values, arg) {
  return values.reduce(function(faulty, value) {
    if (value != null) {
      faulty.push(value);
    }
    return faulty;
  }, []);
}).run();
