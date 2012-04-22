Precommit = {
  validateJson: function(object) {
    var value = object.values[0];
    if (value['metadata']['X-Riak-Deleted']) {
      return object;
    }

    try {
      JSON.parse(value.data);
      return object;
    } catch(error) {
      return {"fail": "Parsing the object failed: " + error}
    }
  }
}

