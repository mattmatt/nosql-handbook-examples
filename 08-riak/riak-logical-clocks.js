var value1 = {
    counter: 3,
    changes: [{
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.873Z',
      client: 1,
    }, {
      attr: 'counter',
      value: 2,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.973Z',
      client: 1,
    }]
  };

var value2 = {
    counter: 3,
    changes: [{
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.873Z',
      client: 1,
    }, {
      attr: 'counter',
      value: 2,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.973Z',
      client: 2,
    }]
  };
  
var value3 = {
    counter: 4,
    changes: [{
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.873Z',
      client: 1,
    }, {
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.983Z',
      client: 3,
    }, {
      attr: 'counter',
      value: 2,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.993Z',
      client: 3,
    }]
  };

var value4 = {
    counter: 3,
    changes: [{
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:42:37.873Z',
      client: 1,
    }, {
      attr: 'counter',
      value: 1,
      op: 'incr',
      timestamp: '2011-11-27T12:41:37.983Z',
      client: 4,
    }, {
      attr: 'counter',
      value: 2,
      op: 'incr',
      timestamp: '2011-11-27T12:40:37.993Z',
      client: 4,
    }]
  };


function sortChanges(changes) {
  return changes.sort(function(change1, change2) {
    if (change1.timestamp < change2.timestamp) {
      return 1;
    } else if (change2.timestamp < change1.timestamp) {
      return -1;
    } else {
      return 0;
    }
  });
}

function filterDuplicates(base, current, changes, acc) {
  var exists = base.filter(function(change) {
    if (change.timestamp === current.timestamp && change.client === current.client) {
      return true;
    } else {
      return false;
    }
  });

  if (exists.length == 0) {
    acc.push(current)
  }
  return acc;
}

function dropDuplicates(changes) {
  return changes.reduce(function(acc, current) {
    return filterDuplicates(acc, current, changes, acc);
  }, []);
}

function dropBaseChanges(base, changes) {
  return changes.reduce(function(acc, current) {
    return filterDuplicates(base.changes, current, changes, acc);
  }, []);
}

function applyChanges(base, changes) {
  console.log(changes);
  changes.forEach(function(change) {
    if (change.op == 'incr') {
      base[change.attr] += change.value;
    }
    base.changes.push(change)
  });
  return base;
}

var base = value2;
var changes = value1.changes.concat(value2.changes).concat(value3.changes).concat(value4.changes);
result = applyChanges(base, dropBaseChanges(base, dropDuplicates(sortChanges(changes))));
console.log(result)
